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
  
        # Update Date & Time and date formatting in summary sheets
        current_date = datetime.date.today()
        current_time = datetime.datetime.now().time()
        for sname in ["Manag Report"]:
            if sname in wb.sheetnames:
                ws = wb[sname]
                
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

                # Update U5 (Available Working Days)
                days_in_month = calendar.monthrange(report_date.year, report_date.month)[1]
                remaining_days = days_in_month - 4  # 4 सुट्ट्या वजा
                cell_u5 = ws.cell(row=5, column=21)
                cell_u5.number_format = '@'
                cell_u5.value = remaining_days

                # Update U6 (Available Working Days)
                today_day = report_date.day  # आजची तारीख
                remaining_days = max(0, days_in_month - today_day - 4)  # 4 सुट्ट्या वजा
                cell_u6 = ws.cell(row=6, column=21)
                cell_u6.number_format = '@'
                cell_u6.value = remaining_days

                # Update C15 (Show Fy YY YY - Prev Year)
                cell_c15 = ws.cell(row=15, column=3)
                cell_c15.number_format = '@'
                cell_c15.value = f"FY {(start_date.year - 1) % 100:02d}-{start_date.year % 100:02d}"

        for sname in ["Manag Report"]:
            if sname in wb.sheetnames:
                ws = wb[sname]
                #------ Saarthi Production Report TCF------
                # Update Daily Plan(Target)
                cell_N11 = ws.cell(row=11, column=14)
                cell_N11.number_format = '@'
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