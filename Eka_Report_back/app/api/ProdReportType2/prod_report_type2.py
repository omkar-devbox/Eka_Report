import os
import sys
import subprocess
import calendar
import datetime
from datetime import date
import openpyxl
import pyodbc
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException


from app.core.database import get_db_connection
from app.schemas.mgmt_prod_report import MgmtProdReportRequest, ProdReportType2Request, OpenFileRequest
from app.constant.queris import (
    SaarthiMickyReportTCFBIW,
    LineStopRecordDaily,
    LineStopRecordMonthly,
)

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[3]
TEMPLATE_PATH = BASE_DIR / "ProductionReport_R3.xlsx"
# OUTPUT_PATH will be defined dynamically after parsing dates


@router.post("/prod-report-type2")
def generate_mgmt_production_report(
    payload: ProdReportType2Request,
    conn: pyodbc.Connection = Depends(get_db_connection)
):
    """
    Generates and populates the Management Production Report for Micky (M_TCF).
    Reads date parameters dynamically from request body, queries raw daily log data,
    performs Daily, Weekly, Monthly, MTD, YTD, and FY calculations, updates the Excel spreadsheet,
    and returns the updated report as a downloadable file.
    """
    # Helper to safely convert None to 0
    def safe_int(value):
        return int(value) if value is not None else 0

    def to_mins(seconds):
        mins = float(seconds) / 60.0 if seconds is not None else 0.0
        return int(mins) if mins % 1 == 0 else round(mins, 1)

    def to_hours(seconds):
        if seconds is None:
            return 0.0
        try:
            val = float(seconds)
            if val <= 24:
                return val
            hours = int(val // 3600)
            minutes = int((val % 3600) // 60)
            return round(hours + minutes / 100.0, 2)
        except (ValueError, TypeError):
            return 0.0

    def populate_row(ws, row_idx, query_row):
        if not query_row:
            return
        ws.cell(row=row_idx, column=5).value = safe_int(query_row[13])
        ws.cell(row=row_idx, column=6).value = safe_int(query_row[14])
        ws.cell(row=row_idx, column=7).value = safe_int(query_row[14]) - safe_int(query_row[13])
        
        ws.cell(row=row_idx, column=8).value = safe_int(query_row[4])
        ws.cell(row=row_idx, column=9).value = safe_int(query_row[6])
        ws.cell(row=row_idx, column=10).value = safe_int(query_row[8])
        ws.cell(row=row_idx, column=11).value = safe_int(query_row[10])
        ws.cell(row=row_idx, column=12).value = safe_int(query_row[12])
        
        ws.cell(row=row_idx, column=13).value = safe_int(query_row[1])
        ws.cell(row=row_idx, column=14).value = safe_int(query_row[2])
        ws.cell(row=row_idx, column=15).value = safe_int(query_row[2]) - safe_int(query_row[1])
        
        ws.cell(row=row_idx, column=16).value = safe_int(query_row[20])
        ws.cell(row=row_idx, column=18).value = safe_int(query_row[16])

        for col_idx in [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18]:
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.number_format = '@'

    try:
        # 1. Parse and validate dates
        try:
            report_date = datetime.datetime.strptime(payload.ReportDate, "%Y-%m-%d").date()
            start_date = datetime.datetime.strptime(payload.StartDate, "%Y-%m-%d").date()
            last_date = datetime.datetime.strptime(payload.LastDate, "%Y-%m-%d").date()
            # Define output path dynamically in the user's Downloads directory
            downloads_dir = Path.home() / "Downloads"
            if not downloads_dir.exists():
                downloads_dir = Path.home()
            now_str = datetime.datetime.now().strftime("%H-%M-%S")
            output_path = downloads_dir / f"MProductionReport_{report_date:%Y-%m-%d}_{now_str}.xlsx"
        except ValueError as val_err:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date format. Expected YYYY-MM-DD. Error: {str(val_err)}"
            )


        # 2. Query Holidays
        cursor = conn.cursor()
      

        # 3. Run main SQL query for Micky
        cursor.execute(SaarthiMickyReportTCFBIW(payload.ReportDate, payload.StartDate, payload.LastDate, payload.Shift,"S_TCF"))
        rows = cursor.fetchall()
        
        columns = [col[0] for col in cursor.description]
        print("--- Daily Line Stop Row Details ---")
        for row in rows:
            for col_name, val in zip(columns, row):
                print(f"{col_name} : {val}")

        cursor.execute(SaarthiMickyReportTCFBIW(payload.ReportDate, payload.StartDate, payload.LastDate, payload.Shift,"M_TCF"))
        rows1 = cursor.fetchall()

        cursor.execute(SaarthiMickyReportTCFBIW(payload.ReportDate, payload.StartDate, payload.LastDate, payload.Shift,"S_BIW"))
        rows2 = cursor.fetchall()



        # 4. Run line stop queries (Daily & Monthly) and Production Loss query
        cursor.execute(LineStopRecordDaily(payload.ReportDate))
        daily_line_stops = cursor.fetchall()

       

        cursor.execute(LineStopRecordMonthly(payload.ReportDate))
        monthly_line_stops = cursor.fetchall()

  
  
        # 6. Load Excel template and populate sheets
        wb = openpyxl.load_workbook(TEMPLATE_PATH)

  

        # G. Update Date & Time and date formatting in summary sheets
        current_date = datetime.date.today()
        current_time = datetime.datetime.now().time()
        
        if "Prod Report" in wb.sheetnames:
            ws = wb["Prod Report"]
            
            # Update Date & Time
            ws.cell(row=2, column=2).value = current_date.strftime("%d-%m-%Y")
            ws.cell(row=3, column=2).value = current_time
            
            # Update Month under General Header (R2)
            ws.cell(row=2, column=18).value = report_date.strftime("%b %Y")
            
            # Available Working Days & Remaining Days
            days_in_month = calendar.monthrange(report_date.year, report_date.month)[1]
            remaining_days = days_in_month - 4  # 4 holidays subtracted
            ws.cell(row=3, column=18).value = remaining_days
            
            today_day = report_date.day
            remaining_days_left = max(0, days_in_month - today_day - 4)
            ws.cell(row=4, column=18).value = remaining_days_left
            
            # Update Month Label in sections (E8, E17, E25)
            month_label = report_date.strftime("%b %Y")
            for r in [8, 17, 25]:
                ws.cell(row=r, column=5).value = month_label
                ws.cell(row=r, column=5).number_format = '@'
                
            # Update Daily Date Label in sections (M8, M17, M25)
            daily_label = report_date.strftime("%d-%b-%Y")
            for r in [8, 17, 25]:
                ws.cell(row=r, column=13).value = daily_label
                ws.cell(row=r, column=13).number_format = '@'
                
            # Update YTD Year Header (P8, P17, P25)
            ytd_label = f"{(start_date.year) % 100:02d}-{(last_date.year) % 100:02d}"
            for r in [8, 17, 25]:
                ws.cell(row=r, column=16).value = ytd_label
                ws.cell(row=r, column=16).number_format = '@'
                
            # Update FY Year Header (R8, R17, R25)
            fy_label = f"{(start_date.year - 1) % 100:02d}-{(start_date.year) % 100:02d}"
            for r in [8, 17, 25]:
                ws.cell(row=r, column=18).value = fy_label
                ws.cell(row=r, column=18).number_format = '@'

            # Update Weekly Headers (W1, W2, W3, W4, W5 -> e.g. W23, W24, W25, W26, W27)
            first_of_month = datetime.date(report_date.year, report_date.month, 1)
            first_weekday = (first_of_month.weekday() + 1) % 7 + 1
            week_headers = {}
            for k in range(1, 6):
                d_start = max(1, 7 * (k - 1) - first_weekday + 2)
                d_end = min(days_in_month, 7 * k - first_weekday + 1)
                if d_start <= days_in_month:
                    mid_day = datetime.date(report_date.year, report_date.month, (d_start + d_end) // 2)
                    week_headers[k] = f"W{mid_day.isocalendar()[1]}"
                else:
                    week_headers[k] = ""

            for r in [9, 18, 26]:
                for k in range(1, 6):
                    col_idx = 7 + k  # columns 8, 9, 10, 11, 12
                    ws.cell(row=r, column=col_idx).value = week_headers[k]
                    ws.cell(row=r, column=col_idx).number_format = '@'

            # Populate Vehicle & BIW Rollout tables
            # Saarthi Vehicle: Row 10
            if rows:
                populate_row(ws, 10, rows[0])
            # Micky Vehicle: Row 11
            if rows1:
                populate_row(ws, 11, rows1[0])
            # Saarthi BIW: Row 19
            if rows2:
                populate_row(ws, 19, rows2[0])

            # A. Populate Daily Line Stops in 'Prod Report' sheet
            daily_row_mapping = {
                "Process Call": 35,
                "Material Call": 36,
                "Quality Call": 37,
                "Maintenance Call": 38,
                "Other": 39
            }
            
            # Initialize table cells to 0/empty to ensure old/cached data is cleared
            for r in daily_row_mapping.values():
                for c in [5, 6, 7, 8, 9, 10, 11, 13]: # Chassis, Trim, Saarthi Main, Saarthi Sub, I-PUMA Main, I-PUMA Sub, Cargo Main, Cargo Sub
                    ws.cell(row=r, column=c).value = 0
                ws.cell(row=r, column=15).value = "" # Chassis Line Loss Reason
                ws.cell(row=r, column=19).value = "" # Remark
            
            # Date at E32
            ws.cell(row=32, column=5).value = report_date.strftime("%d-%m-%Y")
            
            for row in daily_line_stops:
                type_of_call = row[0]
                r = daily_row_mapping.get(type_of_call)
                if r:
                    val_chassis = to_mins(row[1])
                    val_trim = to_mins(row[2])
                    val_saarthi_main = to_mins(row[3])
                    val_saarthi_sub = to_mins(row[4])
                    val_ipuma_main = to_mins(row[5])
                    val_ipuma_sub = to_mins(row[6])
                    val_cargo_main = to_mins(row[7])
                    val_cargo_sub = to_mins(row[8])
                    
                    ws.cell(row=r, column=5).value = val_chassis
                    ws.cell(row=r, column=6).value = val_trim
                    ws.cell(row=r, column=7).value = val_saarthi_main
                    ws.cell(row=r, column=8).value = val_saarthi_sub
                    ws.cell(row=r, column=9).value = val_ipuma_main
                    ws.cell(row=r, column=10).value = val_ipuma_sub
                    ws.cell(row=r, column=11).value = val_cargo_main
                    ws.cell(row=r, column=13).value = val_cargo_sub
                    
                    ws.cell(row=r, column=15).value = row[9]
                    ws.cell(row=r, column=19).value = row[10]

        # Populate Daily sheet
        if "Daily" in wb.sheetnames:
            ws_daily = wb["Daily"]

            def write_daily_block(data_row: int, agg_rows):
                if not agg_rows:
                    # Clear placeholders to 0/empty to prevent raw templates from being left behind
                    ws_daily.cell(row=data_row, column=3).value  = report_date.strftime("%d-%m-%Y")
                    ws_daily.cell(row=data_row, column=4).value  = 0
                    ws_daily.cell(row=data_row, column=5).value  = 0
                    ws_daily.cell(row=data_row, column=6).value  = 0
                    ws_daily.cell(row=data_row, column=7).value  = 0
                    ws_daily.cell(row=data_row, column=8).value  = 0
                    ws_daily.cell(row=data_row, column=9).value  = 0
                    ws_daily.cell(row=data_row, column=10).value = 0
                    ws_daily.cell(row=data_row, column=11).value = 0
                    ws_daily.cell(row=data_row, column=12).value = remaining_days
                    ws_daily.cell(row=data_row, column=13).value = remaining_days_left
                    return
                
                r = agg_rows[0]
                daily_tgt   = safe_int(r[1])
                daily_act   = safe_int(r[2])
                monthly_tgt = safe_int(r[13])
                monthly_act = safe_int(r[14])

                ws_daily.cell(row=data_row, column=3).value  = report_date.strftime("%d-%m-%Y")
                ws_daily.cell(row=data_row, column=4).value  = daily_tgt
                ws_daily.cell(row=data_row, column=5).value  = daily_act
                ws_daily.cell(row=data_row, column=6).value  = daily_act - daily_tgt
                ws_daily.cell(row=data_row, column=7).value  = monthly_tgt
                ws_daily.cell(row=data_row, column=8).value  = monthly_act
                ws_daily.cell(row=data_row, column=9).value  = monthly_act - monthly_tgt
                ws_daily.cell(row=data_row, column=10).value = safe_int(r[20])
                ws_daily.cell(row=data_row, column=11).value = safe_int(r[16])
                ws_daily.cell(row=data_row, column=12).value = remaining_days
                ws_daily.cell(row=data_row, column=13).value = remaining_days_left

            write_daily_block(data_row=2,  agg_rows=rows1)  # M_TCF
            write_daily_block(data_row=12, agg_rows=rows)   # S_TCF
            write_daily_block(data_row=21, agg_rows=None)   # M_BIW
            write_daily_block(data_row=31, agg_rows=rows2)  # S_BIW

         
        # 7. Save and return workbook
        wb.save(output_path)

        return {
            "status": "success",
            "filepath": str(output_path),
            "filename": output_path.name
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/prod-report-type2/open-file")
def open_file_endpoint(payload: OpenFileRequest):
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
def open_folder_endpoint(payload: OpenFileRequest):
    try:
        path = os.path.abspath(payload.filepath)
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="File not found")
        
        if os.name == "nt":
            # Highlight the file in Explorer
            subprocess.Popen(f'explorer /select,"{path}"')

        return {"status": "success", "message": "Folder opened successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))