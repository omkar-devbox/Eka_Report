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
from app.schemas.mgmt_prod_report import ProdReportType2Request, OpenFileRequest
from app.constant.queris import (
    SaarthiMickyReportTCFBIW,
    LineStopRecordDaily,
    LineStopRecordMonthly
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

        # Calculate 6 consecutive Yearly Weeks for the month starting from the first week (G9 to L9, columns 7 to 12)
        first_day = report_date.replace(day=1)
        first_monday = first_day - datetime.timedelta(days=first_day.weekday())
        weekly_headers = []
        for i in range(6):
            week_date = first_monday + datetime.timedelta(days=7 * i)
            iso_year, iso_week, iso_weekday = week_date.isocalendar()
            weekly_headers.append(f"W{iso_week}")


        # 2. Query Holidays
        cursor = conn.cursor()
      

        # 3. Run main SQL query 

        # Saarthi S TCF Report
        cursor.execute(SaarthiMickyReportTCFBIW(payload.ReportDate, payload.StartDate, payload.LastDate, payload.Shift,"S_TCF"))
        rows0 = cursor.fetchall()
        
        columns = [col[0] for col in cursor.description]
        print("--- Daily Line Stop Row Details ---")
        for row in rows0:
            for col_name, val in zip(columns, row):
                print(f"{col_name} : {val}")

        # Micky M TCF Report
        cursor.execute(SaarthiMickyReportTCFBIW(payload.ReportDate, payload.StartDate, payload.LastDate, payload.Shift,"M_TCF"))
        rows1 = cursor.fetchall()

        # Saarthi S BIW Report
        cursor.execute(SaarthiMickyReportTCFBIW(payload.ReportDate, payload.StartDate, payload.LastDate, payload.Shift,"S_BIW"))
        rows2 = cursor.fetchall()

        # Micky M BIW Report
        cursor.execute(SaarthiMickyReportTCFBIW(payload.ReportDate, payload.StartDate, payload.LastDate, payload.Shift,"M_BIW"))
        rows3 = cursor.fetchall()

        # Run line stop queries (Daily & Monthly) and Production Loss query
        cursor.execute(LineStopRecordDaily(payload.ReportDate))
        rows4 = cursor.fetchall()

        cursor.execute(LineStopRecordMonthly(payload.ReportDate))
        rows5 = cursor.fetchall()

        # Load Excel template and populate sheets
        wb = openpyxl.load_workbook(TEMPLATE_PATH)

        def get_sheet(workbook, name):
            if name not in workbook.sheetnames:
                return None
            sheet = workbook[name]
            orig_cell = sheet.cell
            def safe_cell(*args, **kwargs):
                cell = orig_cell(*args, **kwargs)
                if type(cell).__name__ == 'MergedCell':
                    for r in sheet.merged_cells.ranges:
                        if cell.coordinate in r:
                            return orig_cell(row=r.min_row, column=r.min_col)
                return cell
            sheet.cell = safe_cell
            return sheet

        # Update Date & Time and date formatting in summary sheets
        current_date = datetime.date.today()
        current_time = datetime.datetime.now().time()
        for sname in ["Manag Report", "Prod Report"]:
            ws = get_sheet(wb, sname)
            if ws is not None:
                
                # E2 (Date) (Report Generated Current Date)
                cell_e2 = ws.cell(row=2, column=5)
                cell_e2.number_format = '@'
                cell_e2.value = current_date.strftime("%d-%m-%Y")

                # E3 (Time) (Report Generated Time)
                cell_e3 = ws.cell(row=3, column=5)
                cell_e3.number_format = '@'
                cell_e3.value = current_time.strftime("%I:%M %p")

                # E4 (Report Date) (Report Generated Date)
                cell_e4 = ws.cell(row=4, column=5)
                cell_e4.number_format = '@'
                cell_e4.value = report_date.strftime("%d-%m-%Y")

                cell_d32 = ws.cell(row=32, column=4)
                cell_d32.number_format = '@'
                cell_d32.value = report_date.strftime("%d-%m-%Y")

                # U2 (Month) (eg :Jan-2026 Format)
                cell_u2 = ws.cell(row=2, column=21)
                cell_u2.number_format = '@'
                cell_u2.value = report_date.strftime("%b-%Y")

                cell_d8 = ws.cell(row=8, column=4)
                cell_d8.number_format = '@'
                cell_d8.value = report_date.strftime("%b-%Y")

                cell_d17 = ws.cell(row=17, column=4)
                cell_d17.number_format = '@'
                cell_d17.value = report_date.strftime("%b-%Y")

                cell_d25 = ws.cell(row=25, column=4)
                cell_d25.number_format = '@'
                cell_d25.value = report_date.strftime("%b-%Y")

                # Update U3 (Available Working Days)
                days_in_month = calendar.monthrange(report_date.year, report_date.month)[1]
                remaining_days = days_in_month - 4  # 4 सुट्ट्या वजा
                cell_u3 = ws.cell(row=3, column=21)
                cell_u3.number_format = '@'
                cell_u3.value = remaining_days

                # Update U4 (Remaining Working Days)
                today_day = report_date.day  # आजची तारीख
                remaining_days = max(0, days_in_month - today_day - 4)  # 4 सुट्ट्या वजा
                cell_u4 = ws.cell(row=4, column=21)
                cell_u4.number_format = '@'
                cell_u4.value = remaining_days

                # Update G9 to L9 with Yearly Week
                for i, w_header in enumerate(weekly_headers[:6]):
                    cell_w = ws.cell(row=9, column=7 + i)
                    if type(cell_w).__name__ != 'MergedCell':
                        cell_w.number_format = '@'
                        cell_w.value = w_header

                # Update G18 to L18 with Yearly Week
                for i, w_header in enumerate(weekly_headers[:6]):
                    cell_w = ws.cell(row=18, column=7 + i)
                    if type(cell_w).__name__ != 'MergedCell':
                        cell_w.number_format = '@'
                        cell_w.value = w_header

                # Update G26 to L26 with Yearly Week
                for i, w_header in enumerate(weekly_headers[:6]):
                    cell_w = ws.cell(row=26, column=7 + i)
                    if type(cell_w).__name__ != 'MergedCell':
                        cell_w.number_format = '@'
                        cell_w.value = w_header

        for sname in ["Manag Report", "Prod Report"]:
            ws = get_sheet(wb, sname)
            if ws is not None:
                #------ Saarthi D+6 Production Report TCF------
                #D10 for Saarthi Plan
                cell_d10 = ws.cell(row=10, column=4)
                cell_d10.number_format = '@'
                cell_d10.value = rows0[0][15]

                #E10 for Saarthi Act 
                cell_e10 = ws.cell(row=10, column=5)
                cell_e10.number_format = '@'
                cell_e10.value = rows0[0][16]

                #F10 for Saarthi Var 
                cell_f10 = ws.cell(row=10, column=6)
                cell_f10.number_format = '@'
                cell_f10.value = safe_int(rows0[0][16]) - safe_int(rows0[0][15])

                #G10 for Saarthi Week
                cell_g10 = ws.cell(row=10, column=7)
                cell_g10.number_format = '@'
                cell_g10.value = rows0[0][4]

                #H10 for Saarthi Week
                cell_h10 = ws.cell(row=10, column=8)
                cell_h10.number_format = '@'
                cell_h10.value = rows0[0][6]

                #I10 for Saarthi Week 
                cell_i10 = ws.cell(row=10, column=9)
                cell_i10.number_format = '@'
                cell_i10.value = rows0[0][8]

                #J10 for Saarthi Week 
                cell_j10 = ws.cell(row=10, column=10)
                cell_j10.number_format = '@'
                cell_j10.value = rows0[0][10]

                #K10 for Saarthi Week 
                cell_k10 = ws.cell(row=10, column=11)
                cell_k10.number_format = '@'
                cell_k10.value = rows0[0][12]

                #L10 for Saarthi Week 
                cell_l10 = ws.cell(row=10, column=12)
                cell_l10.number_format = '@'
                cell_l10.value = rows0[0][14]

                #M10 for Saarthi Plan 
                cell_m10 = ws.cell(row=10, column=13)
                cell_m10.number_format = '@'
                cell_m10.value = rows0[0][1]

                #N10 for Saarthi Act 
                cell_n10 = ws.cell(row=10, column=14)
                cell_n10.number_format = '@'
                cell_n10.value = rows0[0][2]

                #O10 for Saarthi Var 
                cell_o10 = ws.cell(row=10, column=15)
                cell_o10.number_format = '@'
                cell_o10.value = safe_int(rows0[0][2]) - safe_int(rows0[0][1])

                #P10 for Saarthi MTD Plan
                cell_p10 = ws.cell(row=10, column=16)
                cell_p10.number_format = '@'
                cell_p10.value = rows0[0][19]

                #Q10 for Saarthi MTD Act 
                cell_q10 = ws.cell(row=10, column=17)
                cell_q10.number_format = '@'
                cell_q10.value = rows0[0][20]

                #R10 for Saarthi MTD Var 
                cell_r10 = ws.cell(row=10, column=18)
                cell_r10.number_format = '@'
                cell_r10.value = safe_int(rows0[0][20]) - safe_int(rows0[0][19])


                #S10 for Saarthi YTD Act
                cell_s10 = ws.cell(row=10, column=19)
                cell_s10.number_format = '@'
                cell_s10.value = rows0[0][22]

                #U10 for Saarthi YTD ACT
                cell_u10 = ws.cell(row=10, column=21)
                cell_u10.number_format = '@'
                cell_u10.value = rows0[0][18]


                #------ Micky D+3 Production Report TCF------
                #D11 for Saarthi Total Cars 
                cell_d11 = ws.cell(row=11, column=4)
                cell_d11.number_format = '@'
                cell_d11.value = rows1[0][15]

                #E11 for Saarthi Total Cars 
                cell_e11 = ws.cell(row=11, column=5)
                cell_e11.number_format = '@'
                cell_e11.value = rows1[0][16]

                #F11 for Saarthi Total Cars 
                cell_f11 = ws.cell(row=11, column=6)
                cell_f11.number_format = '@'
                cell_f11.value = safe_int(rows1[0][16]) - safe_int(rows1[0][15])

                #G11 for Saarthi Total Cars 
                cell_g11 = ws.cell(row=11, column=7)
                cell_g11.number_format = '@'
                cell_g11.value = rows1[0][4]

                #H11 for Saarthi Total Cars 
                cell_h11 = ws.cell(row=11, column=8)
                cell_h11.number_format = '@'
                cell_h11.value = rows1[0][6]

                #I11 for Saarthi Total Cars 
                cell_i11 = ws.cell(row=11, column=9)
                cell_i11.number_format = '@'
                cell_i11.value = rows1[0][8]

                #J11 for Saarthi Total Cars 
                cell_j11 = ws.cell(row=11, column=10)
                cell_j11.number_format = '@'
                cell_j11.value = rows1[0][10]

                #K11 for Saarthi Total Cars 
                cell_k11 = ws.cell(row=11, column=11)
                cell_k11.number_format = '@'
                cell_k11.value = rows1[0][12]

                #L11 for Saarthi Total Cars 
                cell_l11 = ws.cell(row=11, column=12)
                cell_l11.number_format = '@'
                cell_l11.value = rows1[0][14]

                #M11 for Saarthi Total Cars 
                cell_m11 = ws.cell(row=11, column=13)
                cell_m11.number_format = '@'
                cell_m11.value = rows1[0][1]

                #N11 for Saarthi Total Cars 
                cell_n11 = ws.cell(row=11, column=14)
                cell_n11.number_format = '@'
                cell_n11.value = rows1[0][2]

                #O11 for Saarthi Total Cars 
                cell_o11 = ws.cell(row=11, column=15)
                cell_o11.number_format = '@'
                cell_o11.value = safe_int(rows1[0][2]) - safe_int(rows1[0][1])

                #P11 for Saarthi Total Cars 
                cell_p11 = ws.cell(row=11, column=16)
                cell_p11.number_format = '@'
                cell_p11.value = rows1[0][19]

                #Q11 for Saarthi Total Cars 
                cell_q11 = ws.cell(row=11, column=17)
                cell_q11.number_format = '@'
                cell_q11.value = rows1[0][20]

                #R11 for Saarthi Total Cars 
                cell_r11 = ws.cell(row=11, column=18)
                cell_r11.number_format = '@'
                cell_r11.value = safe_int(rows1[0][20]) - safe_int(rows1[0][19])

                #S11 for Saarthi Total Cars 
                cell_s11 = ws.cell(row=11, column=19)
                cell_s11.number_format = '@'
                cell_s11.value = rows1[0][21]

                #T11 for Saarthi Total Cars 
                cell_t11 = ws.cell(row=11, column=20)
                cell_t11.number_format = '@'
                cell_t11.value = rows1[0][22]

                #U11 for Saarthi Total Cars 
                cell_u11 = ws.cell(row=11, column=21)
                cell_u11.number_format = '@'
                cell_u11.value = rows1[0][18]


                #------ Saarthi D+6 Production Report BIW------
                #D19 for Saarthi Total Cars 
                cell_d19 = ws.cell(row=19, column=4)
                cell_d19.number_format = '@'
                cell_d19.value = rows2[0][15]

                #E19 for Saarthi Total Cars 
                cell_e19 = ws.cell(row=19, column=5)
                cell_e19.number_format = '@'
                cell_e19.value = rows2[0][16]

                #F19 for Saarthi Total Cars 
                cell_f19 = ws.cell(row=19, column=6)
                cell_f19.number_format = '@'
                cell_f19.value = safe_int(rows2[0][16]) - safe_int(rows2[0][15])

                #G19 for Saarthi Total Cars 
                cell_g19 = ws.cell(row=19, column=7)
                cell_g19.number_format = '@'
                cell_g19.value = rows2[0][4]

                #H19 for Saarthi Total Cars 
                cell_h19 = ws.cell(row=19, column=8)
                cell_h19.number_format = '@'
                cell_h19.value = rows2[0][6]

                #I19 for Saarthi Total Cars 
                cell_i19 = ws.cell(row=19, column=9)
                cell_i19.number_format = '@'
                cell_i19.value = rows2[0][8]

                #J19 for Saarthi Total Cars 
                cell_j19 = ws.cell(row=19, column=10)
                cell_j19.number_format = '@'
                cell_j19.value = rows2[0][10]

                #K19 for Saarthi Total Cars 
                cell_k19 = ws.cell(row=19, column=11)
                cell_k19.number_format = '@'
                cell_k19.value = rows2[0][12]

                #L19 for Saarthi Total Cars 
                cell_l19 = ws.cell(row=19, column=12)
                cell_l19.number_format = '@'
                cell_l19.value = rows2[0][14]

                #M19 for Saarthi Total Cars 
                cell_m19 = ws.cell(row=19, column=13)
                cell_m19.number_format = '@'
                cell_m19.value = rows2[0][1]

                #N19 for Saarthi Total Cars 
                cell_n19 = ws.cell(row=19, column=14)
                cell_n19.number_format = '@'
                cell_n19.value = rows2[0][2]

                #O19 for Saarthi Total Cars 
                cell_o19 = ws.cell(row=19, column=15)
                cell_o19.number_format = '@'
                cell_o19.value = safe_int(rows2[0][2]) - safe_int(rows2[0][1])

                #P19 for Saarthi Total Cars 
                cell_p19 = ws.cell(row=19, column=16)
                cell_p19.number_format = '@'
                cell_p19.value = rows2[0][19]

                #Q19 for Saarthi Total Cars 
                cell_q19 = ws.cell(row=19, column=17)
                cell_q19.number_format = '@'
                cell_q19.value = rows2[0][20]

                #R19 for Saarthi Total Cars 
                cell_r19 = ws.cell(row=19, column=18)
                cell_r19.number_format = '@'
                cell_r19.value = safe_int(rows2[0][20]) - safe_int(rows2[0][19])

                #S19 for Saarthi Total Cars 
                cell_s19 = ws.cell(row=19, column=19)
                cell_s19.number_format = '@'
                cell_s19.value = rows2[0][21]

                #T19 for Saarthi Total Cars 
                cell_t19 = ws.cell(row=19, column=20)
                cell_t19.number_format = '@'
                cell_t19.value = rows2[0][22]

                #U19 for Saarthi Total Cars 
                cell_u19 = ws.cell(row=19, column=21)
                cell_u19.number_format = '@'
                cell_u19.value = rows2[0][18]

        # Populate Daily Line Stops in 'Prod Report' sheet
        ws_prod = get_sheet(wb, "Prod Report")
        if ws_prod is not None:
            daily_row_mapping = {
                "Process Call": 35,
                "Process": 35,
                "Material Call": 36,
                "Material": 36,
                "Quality Call": 37,
                "Quality": 37,
                "Maintenance Call": 38,
                "Maintenance": 38,
                "Other": 39
            }
            for row in rows4:
                type_of_call = row[0]
                r = daily_row_mapping.get(type_of_call)
                if r:
                    # Col 4 (D): Chassis (row[1])
                    ws_prod.cell(row=r, column=4).value = to_mins(row[1])
                    # Col 5 (E): Trim (row[2])
                    ws_prod.cell(row=r, column=5).value = to_mins(row[2])
                    # Col 6 (F): Saarthi Main (row[3])
                    ws_prod.cell(row=r, column=6).value = to_mins(row[3])
                    # Col 7 (G): Saarthi Sub (row[4])
                    ws_prod.cell(row=r, column=7).value = to_mins(row[4])
                    # Col 8 (H): I-Puma Main (row[5])
                    ws_prod.cell(row=r, column=8).value = to_mins(row[5])
                    # Col 9 (I): I-Puma Sub (row[6])
                    ws_prod.cell(row=r, column=9).value = to_mins(row[6])
                    # Col 10 (J): Cargo Main (row[7])
                    ws_prod.cell(row=r, column=10).value = to_mins(row[7])
                    # Col 11 (K): Cargo Sub (row[8])
                    ws_prod.cell(row=r, column=11).value = to_mins(row[8])
                    # Col 12 (L): Chassis Line Loss Reason (row[9])
                    ws_prod.cell(row=r, column=12).value = row[9]
                    # Col 19 (S): Remark (row[10])
                    ws_prod.cell(row=r, column=19).value = row[10]

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