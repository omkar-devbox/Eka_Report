import os
import sys
import subprocess
import datetime
import openpyxl
import pyodbc
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import get_db_connection
from app.schemas.mgmt_prod_report import ProdReportType2Request, OpenFileRequest
from app.constant.queris import (
    SaarthiMickyReportTCFBIW1,        # monthly / daily / YTD / FY aggregates
    SaarthiMickyWeekwiseMonthly,       # ISO week-by-week actuals for the month
    LineStopRecordDaily,
)

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[3]
TEMPLATE_PATH = BASE_DIR / "ProductionReport_R3.xlsx"

# ---------------------------------------------------------------------------
# SaarthiMickyReportTCFBIW1 -- actual result column index map (22 cols, 0-21)
# ---------------------------------------------------------------------------
#  [00]  DT
#  [01]  DAILY_TARGET
#  [02]  DAILY_ACTUAL
#  [03]  W1_TARGET    [04]  W1_ACTUAL
#  [05]  W2_TARGET    [06]  W2_ACTUAL
#  [07]  W3_TARGET    [08]  W3_ACTUAL
#  [09]  W4_TARGET    [10]  W4_ACTUAL
#  [11]  W5_TARGET    [12]  W5_ACTUAL   (WeekNo >= 5 merged)
#  [13]  MONTHLY_TARGET
#  [14]  MONTHLY_ACTUAL
#  [15]  TARGET_PREVIOUS_FINANCIAL_YEAR
#  [16]  ACTUAL_PREVIOUS_FINANCIAL_YEAR
#  [17]  MTD_TARGET
#  [18]  MTD_ACTUAL
#  [19]  YTD_TARGET
#  [20]  YTD_ACTUAL
#  [21]  DAYS_IN_MONTH
# ---------------------------------------------------------------------------
IDX_DT              = 0
IDX_DAILY_TARGET    = 1
IDX_DAILY_ACTUAL    = 2
IDX_MONTHLY_TARGET  = 13
IDX_MONTHLY_ACTUAL  = 14
IDX_PFY_ACTUAL      = 16   # Previous Financial Year Actual -> FY column (R)
IDX_YTD_ACTUAL      = 20   # Year-to-Date Actual            -> YTD column (P)
IDX_DAYS_IN_MONTH   = 21   # max valid index = 21

# SaarthiMickyWeekwiseMonthly returns 3 cols per row
IDX_WW_ISOWEEK  = 0   # ISO week number (int)
IDX_WW_TARGET   = 1   # WK_TARGET
IDX_WW_ACTUAL   = 2   # WK_ACTUAL

# Excel columns for the 5 week slots (H I J K L)
WEEK_EXCEL_COLS = [8, 9, 10, 11, 12]


def get_month_iso_weeks(report_date: datetime.date) -> list:
    """
    Return a sorted list of ISO 8601 week numbers that have at least one day
    in the same calendar month as report_date.

    Example: June 2026  ->  [23, 24, 25, 26, 27]
    A month can span 4, 5 or (rarely) 6 ISO weeks.
    """
    year, month = report_date.year, report_date.month
    seen = set()
    weeks = []
    d = datetime.date(year, month, 1)
    while d.month == month:
        wk = d.isocalendar()[1]
        if wk not in seen:
            seen.add(wk)
            weeks.append(wk)
        d += datetime.timedelta(days=1)
    return sorted(weeks)


def build_weekwise_dict(weekwise_rows) -> dict:
    """
    Convert weekwise query rows into a dict: {iso_week: (wk_target, wk_actual)}.
    Missing weeks get (0, 0) by default via .get().
    """
    return {int(r[IDX_WW_ISOWEEK]): (int(r[IDX_WW_TARGET] or 0), int(r[IDX_WW_ACTUAL] or 0))
            for r in weekwise_rows}


@router.post("/prod-report-type2")
def generate_prod_report_type2(
    payload: ProdReportType2Request,
    conn: pyodbc.Connection = Depends(get_db_connection),
):
    """
    Generates and populates the Production Report Type-2 (ProductionReport_R3.xlsx).

    Weekly columns (H-L) are dynamic: they show the actual ISO calendar week
    numbers for the report month (e.g. W23, W24, W25, W26, W27 for June).

    Section mapping:
        Vehicle (rows 10-13): Saarthi->S_TCF, Micky->M_TCF, Cargo/I-Puma->0
        BIW     (rows 19-21): Saarthi->S_BIW, Cargo/I-Puma->0
        Paint   (rows 27-30): all->0 (tables not yet live)
        Station Call (35-39): from LineStopRecordDaily

    Column layout per vehicle/BIW row:
        E(5)  = Monthly Plan    (MONTHLY_TARGET idx 13)
        F(6)  = Monthly Actual  (MONTHLY_ACTUAL idx 14)
        G(7)  = Monthly Var     (Actual - Plan)
        H(8)  = WXX Actual      (1st ISO week of month)
        I(9)  = WXX Actual      (2nd ISO week of month)
        J(10) = WXX Actual      (3rd ISO week of month)
        K(11) = WXX Actual      (4th ISO week of month)
        L(12) = WXX Actual      (5th ISO week of month, if exists)
        M(13) = Daily Plan      (DAILY_TARGET idx 1)
        N(14) = Daily Actual    (DAILY_ACTUAL idx 2)
        O(15) = Daily Var       (Actual - Plan)
        P(16) = YTD Actual      (YTD_ACTUAL idx 20)
        R(18) = FY Actual       (ACTUAL_PFY  idx 16)
    """

    # ── helpers ───────────────────────────────────────────────────────────────
    def safe_int(value):
        return int(value) if value is not None else 0

    def to_mins(seconds):
        if seconds is None:
            return 0
        mins = float(seconds) / 60.0
        return int(mins) if mins % 1 == 0 else round(mins, 1)

    try:
        # ── 1. Parse dates ────────────────────────────────────────────────────
        try:
            report_date = datetime.datetime.strptime(payload.ReportDate, "%Y-%m-%d").date()
            start_date  = datetime.datetime.strptime(payload.StartDate,  "%Y-%m-%d").date()
            last_date   = datetime.datetime.strptime(payload.LastDate,   "%Y-%m-%d").date()

            downloads_dir = Path.home() / "Downloads"
            if not downloads_dir.exists():
                downloads_dir = Path.home()
            now_str     = datetime.datetime.now().strftime("%H-%M-%S")
            output_path = downloads_dir / f"ProductionReport_R3_{report_date:%Y-%m-%d}_{now_str}.xlsx"
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date format. Expected YYYY-MM-DD. Error: {e}",
            )

        # ── 2. Compute ISO weeks for the report month ─────────────────────────
        month_iso_weeks = get_month_iso_weeks(report_date)
        # month_iso_weeks e.g. [23, 24, 25, 26, 27] for June 2026
        # Cap at 5 columns (H-L); if a month has 6 ISO weeks, the 6th overflows
        display_weeks = month_iso_weeks[:5]
        print(f"[ProdReportType2] Report month ISO weeks: {month_iso_weeks} (displaying: {display_weeks})")

        # ── 3. Run SQL queries ────────────────────────────────────────────────
        cursor = conn.cursor()

        def run_aggregate(db_name: str):
            """Run SaarthiMickyReportTCFBIW1 (monthly / daily / YTD / FY)."""
            cursor.execute(SaarthiMickyReportTCFBIW1(
                payload.ReportDate, payload.StartDate, payload.LastDate,
                payload.Shift, db_name,
            ))
            rows = cursor.fetchall()
            print(f"  [aggregate] {db_name}: {len(rows)} row(s)")
            return rows

        def run_weekwise(db_name: str):
            """Run SaarthiMickyWeekwiseMonthly (ISO week breakdown)."""
            cursor.execute(SaarthiMickyWeekwiseMonthly(
                payload.ReportDate, payload.Shift, db_name,
            ))
            rows = cursor.fetchall()
            wkdict = build_weekwise_dict(rows)
            print(f"  [weekwise]  {db_name}: {wkdict}")
            return wkdict

        # Vehicle TCF
        rows_stcf    = run_aggregate("S_TCF")
        wkdict_stcf  = run_weekwise("S_TCF")

        rows_mtcf    = run_aggregate("M_TCF")
        wkdict_mtcf  = run_weekwise("M_TCF")

        # BIW
        rows_sbiw    = run_aggregate("S_BIW")
        wkdict_sbiw  = run_weekwise("S_BIW")

        # Station Call
        cursor.execute(LineStopRecordDaily(payload.ReportDate))
        daily_line_stops = cursor.fetchall()

        cursor.close()

        # ── 4. Load Excel template ────────────────────────────────────────────
        wb = openpyxl.load_workbook(TEMPLATE_PATH)

        if "Prod Report" not in wb.sheetnames:
            raise HTTPException(
                status_code=500,
                detail="Template sheet 'Prod Report' not found in ProductionReport_R3.xlsx",
            )
        ws = wb["Prod Report"]

        # ── 5. Report header (rows 2-4) ───────────────────────────────────────
        current_time = datetime.datetime.now().time()
        ws.cell(row=2, column=2).value = report_date.strftime("%d-%m-%Y")  # B2 Date
        ws.cell(row=3, column=2).value = current_time                       # B3 Time

        month_label = report_date.strftime("%b %Y")          # "Jun 2026"
        date_label  = report_date.strftime("%d-%b-%Y")       # "09-Jun-2026"
        fy_label    = (f"{start_date.year % 100:02d}-"
                       f"{last_date.year % 100:02d}")        # "26-27"

        # Working days from DAYS_IN_MONTH
        if rows_stcf:
            total_days     = safe_int(rows_stcf[0][IDX_DAYS_IN_MONTH])
            remaining_days = max(0, total_days - report_date.day - 4)
        else:
            total_days = remaining_days = 0

        ws.cell(row=2, column=18).number_format = "@"
        ws.cell(row=2, column=18).value = month_label    # R2
        ws.cell(row=3, column=18).value = total_days     # R3
        ws.cell(row=4, column=18).value = remaining_days # R4

        # ── 6. Section date/label headers & dynamic week labels ───────────────
        # header_row -> (label_row_for_sub_headers)
        SECTION_ROWS = {
            8:  9,    # Vehicle  -- section header row 8, sub-header (week labels) row 9
            17: 18,   # BIW      -- section header row 17, sub-header row 18
            25: 26,   # Paint    -- section header row 25, sub-header row 26
        }

        for hdr_row, sub_row in SECTION_ROWS.items():
            # Section-level labels (month, daily date, YTD FY)
            ws.cell(row=hdr_row, column=5).number_format  = "@"
            ws.cell(row=hdr_row, column=5).value  = month_label   # E: Monthly label
            ws.cell(row=hdr_row, column=13).number_format = "@"
            ws.cell(row=hdr_row, column=13).value = date_label    # M: Daily date
            ws.cell(row=hdr_row, column=16).number_format = "@"
            ws.cell(row=hdr_row, column=16).value = fy_label      # P: YTD FY label

            # Dynamic ISO week sub-headers (e.g. W23, W24, W25, W26, W27)
            for slot_idx, col in enumerate(WEEK_EXCEL_COLS):
                if slot_idx < len(display_weeks):
                    ws.cell(row=sub_row, column=col).value = f"W{display_weeks[slot_idx]}"
                else:
                    ws.cell(row=sub_row, column=col).value = ""   # clear unused slot

        # ── 7. Helper: write one vehicle / BIW row ────────────────────────────
        def write_vehicle_row(
            row_num: int,
            agg_rows,          # from SaarthiMickyReportTCFBIW1
            wkdict: dict,      # from SaarthiMickyWeekwiseMonthly
        ):
            """
            Fill E-R for one production row using aggregate + weekwise data.
            wkdict: {iso_week: (wk_target, wk_actual)}
            """
            if agg_rows:
                r = agg_rows[0]
                monthly_tgt = safe_int(r[IDX_MONTHLY_TARGET])
                monthly_act = safe_int(r[IDX_MONTHLY_ACTUAL])
                daily_tgt   = safe_int(r[IDX_DAILY_TARGET])
                daily_act   = safe_int(r[IDX_DAILY_ACTUAL])
                ytd_act     = safe_int(r[IDX_YTD_ACTUAL])
                pfy_act     = safe_int(r[IDX_PFY_ACTUAL])
            else:
                monthly_tgt = monthly_act = daily_tgt = daily_act = 0
                ytd_act = pfy_act = 0

            # Monthly (E, F, G)
            ws.cell(row=row_num, column=5).value  = monthly_tgt
            ws.cell(row=row_num, column=6).value  = monthly_act
            ws.cell(row=row_num, column=7).value  = monthly_act - monthly_tgt

            # Dynamic ISO-week actuals (H-L) — up to 5 weeks
            for slot_idx, col in enumerate(WEEK_EXCEL_COLS):
                if slot_idx < len(display_weeks):
                    iso_wk = display_weeks[slot_idx]
                    _, wk_act = wkdict.get(iso_wk, (0, 0))
                    ws.cell(row=row_num, column=col).value = wk_act
                else:
                    ws.cell(row=row_num, column=col).value = 0  # clear unused slot

            # Daily (M, N, O)
            ws.cell(row=row_num, column=13).value = daily_tgt
            ws.cell(row=row_num, column=14).value = daily_act
            ws.cell(row=row_num, column=15).value = daily_act - daily_tgt

            # YTD (P) and Previous FY (R)
            ws.cell(row=row_num, column=16).value = ytd_act
            ws.cell(row=row_num, column=18).value = pfy_act

        # ── 8. Vehicle Production Details (rows 10-13) ───────────────────────
        write_vehicle_row(10, rows_stcf, wkdict_stcf)   # Saarthi <- S_TCF
        write_vehicle_row(11, rows_mtcf, wkdict_mtcf)   # Micky   <- M_TCF
        write_vehicle_row(12, None,      {})             # Cargo   -> 0
        write_vehicle_row(13, None,      {})             # I-Puma  -> 0

        # ── 9. BIW Production Details (rows 19-21) ───────────────────────────
        write_vehicle_row(19, rows_sbiw, wkdict_sbiw)   # Saarthi <- S_BIW
        write_vehicle_row(20, None,      {})             # Cargo   -> 0
        write_vehicle_row(21, None,      {})             # I-Puma  -> 0

        # ── 10. Paint Shop (rows 27-30) -- all 0, Paint MTD Rollout empty ────
        for paint_row in [27, 28, 29, 30]:
            write_vehicle_row(paint_row, None, {})

        # ── 11. Station Call section ──────────────────────────────────────────
        ws.cell(row=32, column=5).value = datetime.datetime.combine(
            report_date, datetime.time()
        )

        CALL_TYPE_ROWS = {
            "Process Call":     35,
            "Material Call":    36,
            "Quality Call":     37,
            "Maintenance Call": 38,
            "Other":            39,
        }

        line_stop_map: dict = {}
        for ls_row in daily_line_stops:
            ct = ls_row[0]
            if ct in CALL_TYPE_ROWS:
                line_stop_map[ct] = ls_row

        for call_text, excel_row in CALL_TYPE_ROWS.items():
            ls = line_stop_map.get(call_text)
            if ls:
                chassis      = to_mins(ls[1])
                trim         = to_mins(ls[2])
                saarthi_main = to_mins(ls[3])
                saarthi_sub  = to_mins(ls[4])
                ipuma_main   = to_mins(ls[5])
                ipuma_sub    = to_mins(ls[6])
                cargo_main   = to_mins(ls[7])
                cargo_sub    = to_mins(ls[8])
                loss_reason  = ls[9]  if ls[9]  is not None else ""
                remark       = ls[10] if ls[10] is not None else ""
            else:
                chassis = trim = saarthi_main = saarthi_sub = 0
                ipuma_main = ipuma_sub = cargo_main = cargo_sub = 0
                loss_reason = remark = ""

            ws.cell(row=excel_row, column=5).value  = chassis
            ws.cell(row=excel_row, column=6).value  = trim
            ws.cell(row=excel_row, column=7).value  = saarthi_main
            ws.cell(row=excel_row, column=8).value  = saarthi_sub
            ws.cell(row=excel_row, column=9).value  = ipuma_main
            ws.cell(row=excel_row, column=10).value = ipuma_sub
            ws.cell(row=excel_row, column=11).value = cargo_main
            ws.cell(row=excel_row, column=13).value = cargo_sub
            ws.cell(row=excel_row, column=15).value = loss_reason
            ws.cell(row=excel_row, column=19).value = remark

        # ── 12. Daily sheet (if present) ─────────────────────────────────────
        if "Daily" in wb.sheetnames:
            ws_daily = wb["Daily"]

            def write_daily_block(data_row: int, agg_rows):
                if not agg_rows:
                    return
                r = agg_rows[0]
                daily_tgt   = safe_int(r[IDX_DAILY_TARGET])
                daily_act   = safe_int(r[IDX_DAILY_ACTUAL])
                monthly_tgt = safe_int(r[IDX_MONTHLY_TARGET])
                monthly_act = safe_int(r[IDX_MONTHLY_ACTUAL])

                ws_daily.cell(row=data_row, column=3).value  = report_date.strftime("%d-%m-%Y")
                ws_daily.cell(row=data_row, column=4).value  = daily_tgt
                ws_daily.cell(row=data_row, column=5).value  = daily_act
                ws_daily.cell(row=data_row, column=6).value  = daily_act - daily_tgt
                ws_daily.cell(row=data_row, column=7).value  = monthly_tgt
                ws_daily.cell(row=data_row, column=8).value  = monthly_act
                ws_daily.cell(row=data_row, column=9).value  = monthly_act - monthly_tgt
                ws_daily.cell(row=data_row, column=10).value = safe_int(r[IDX_YTD_ACTUAL])
                ws_daily.cell(row=data_row, column=11).value = safe_int(r[IDX_PFY_ACTUAL])
                ws_daily.cell(row=data_row, column=12).value = total_days
                ws_daily.cell(row=data_row, column=13).value = remaining_days

            write_daily_block(data_row=2,  agg_rows=rows_mtcf)
            write_daily_block(data_row=12, agg_rows=rows_stcf)
            write_daily_block(data_row=31, agg_rows=rows_sbiw)

        # ── 13. Save and return ───────────────────────────────────────────────
        wb.save(output_path)
        print(f"[ProdReportType2] Saved -> {output_path}")

        return {
            "status":      "success",
            "filepath":    str(output_path),
            "filename":    output_path.name,
            "weekLabels":  [f"W{w}" for w in display_weeks],  # e.g. ["W23","W24","W25","W26","W27"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Utility endpoints ─────────────────────────────────────────────────────────

@router.post("/prod-report-type2/open-file")
def open_report_type2_file(payload: OpenFileRequest):
    """Open a generated ProductionReport_R3 file on the host OS."""
    try:
        path = os.path.abspath(payload.filepath)
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="File not found")
        if os.name == "nt":
            os.startfile(path)
        else:
            opener = "open" if sys.platform == "darwin" else "xdg-open"
            subprocess.call([opener, path])
        return {"status": "success", "message": "File opened successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/prod-report-type2/open-folder")
def open_report_type2_folder(payload: OpenFileRequest):
    """Highlight a generated ProductionReport_R3 file in Windows Explorer."""
    try:
        path = os.path.abspath(payload.filepath)
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="File not found")
        if os.name == "nt":
            subprocess.Popen(f'explorer /select,"{path}"')
        return {"status": "success", "message": "Folder opened successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
