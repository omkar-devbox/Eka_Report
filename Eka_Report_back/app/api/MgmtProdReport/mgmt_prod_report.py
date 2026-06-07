import os
import sys
import subprocess
from app.constant.queris import S_BIW
import calendar
import datetime
import openpyxl
import pyodbc
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.database import get_db_connection
from app.schemas.mgmt_prod_report import MgmtProdReportRequest, OpenFileRequest
from app.constant.queris import M_TCF, S_TCF

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[3]
TEMPLATE_PATH = BASE_DIR / "EKA Production Report_R2.xlsx"
# OUTPUT_PATH will be defined dynamically after parsing dates


@router.post("/mgmt-production-report")
def generate_mgmt_production_report(
    payload: MgmtProdReportRequest,
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
            output_path = downloads_dir / f"EKA Production Report_R2_{report_date:%Y-%m-%d}.xlsx"
        except ValueError as val_err:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date format. Expected YYYY-MM-DD. Error: {str(val_err)}"
            )


        # 2. Query Holidays
        cursor = conn.cursor()
      

        # 3. Run main SQL query for Micky
        cursor.execute(S_TCF(payload.ReportDate, payload.StartDate, payload.LastDate))
        rows = cursor.fetchall()

        cursor.execute(M_TCF(payload.ReportDate, payload.StartDate, payload.LastDate))
        rows1 = cursor.fetchall()

        cursor.execute(S_BIW(payload.ReportDate, payload.StartDate, payload.LastDate))
        rows2 = cursor.fetchall()

        cursor.execute(M_TCF(payload.ReportDate, payload.StartDate, payload.LastDate))
        rows3 = cursor.fetchall()

        
        cursor.close()


        # 6. Load Excel template and populate sheets
        wb = openpyxl.load_workbook(TEMPLATE_PATH)

  

        # G. Update Date & Time and date formatting in summary sheets
        current_time = datetime.datetime.now().time()
        for sname in ["SQL Work"]:
            if sname in wb.sheetnames:
                ws = wb[sname]
                ws.cell(row=6, column=2).value = report_date.strftime("%d-%m-%Y")
                ws.cell(row=7, column=2).value = current_time
                
                # Update E9 (Monthly: Short month name - YYYY, e.g. Jun-2026)
                cell_e9 = ws.cell(row=9, column=5)
                cell_e9.number_format = '@'
                cell_e9.value = report_date.strftime("%b-%Y")

                # Update E15 (Monthly: Short month name - YYYY, e.g. Jun-2026)
                cell_e15 = ws.cell(row=15, column=5)
                cell_e15.number_format = '@'
                cell_e15.value = report_date.strftime("%b-%Y")
                
                # Update N9 (Daily: DD-Short month name-YYYY, e.g. 07-Jun-2026)
                cell_n9 = ws.cell(row=9, column=14)
                cell_n9.number_format = '@'
                cell_n9.value = report_date.strftime("%d-%b-%Y")

                # Update N15 (Daily: DD-Short month name-YYYY, e.g. 07-Jun-2026)
                cell_n15 = ws.cell(row=15, column=14)
                cell_n15.number_format = '@'
                cell_n15.value = report_date.strftime("%d-%b-%Y")
                
                # Update Q9 (MTD: DD-Short month name, e.g. 07-Jun)
                cell_q9 = ws.cell(row=9, column=17)
                cell_q9.number_format = '@'
                cell_q9.value = report_date.strftime("%d-%b")
                
                # Update U4 (Show DD YYYY)
                cell_u4 = ws.cell(row=4, column=21)
                cell_u4.number_format = '@'
                cell_u4.value = report_date.strftime("%d %Y")

                # Update C15 (Show Fy YY YY)
                cell_c15 = ws.cell(row=15, column=3)
                cell_c15.number_format = '@'
                cell_c15.value = f"FY {start_date:%y}-{last_date:%y}"


            #------ Saarthi Production Report TCF------
                # Update Daily Plan(Target)
                cell_N11 = ws.cell(row=11, column=14)
                cell_N11.number_format = '@'
                cell_N11.value = rows[0][1]

                # Update Daily Plan(Production)
                cell_O11 = ws.cell(row=11, column=15)
                cell_O11.number_format = '@'
                cell_O11.value = rows[0][2]

                # Update Daily Plan(Achievement)
                cell_P11 = ws.cell(row=11, column=16)
                cell_P11.number_format = '@'
                cell_P11.value = safe_int(rows[0][1]) - safe_int(rows[0][2])

                # MTD(Month To Date Actual)
                cell_Q11 = ws.cell(row=11, column=17)
                cell_Q11.number_format = '@'
                cell_Q11.value = safe_int(rows[0][17])

                # MTD(Month To Date Target)
                cell_R11 = ws.cell(row=11, column=18)
                cell_R11.number_format = '@'
                cell_R11.value = safe_int(rows[0][18])

                # MTD(Month To Date Achievement)
                cell_S11 = ws.cell(row=11, column=19)
                cell_S11.number_format = '@'
                cell_S11.value = safe_int(rows[0][17]) - safe_int(rows[0][18])

                # YTD(Year To Date Target)
                cell_T11 = ws.cell(row=11, column=20)
                cell_T11.number_format = '@'
                cell_T11.value = safe_int(rows[0][20])

                # FY(FY Year Target)
                cell_U11 = ws.cell(row=11, column=21)
                cell_U11.number_format = '@'
                cell_U11.value = safe_int(rows[0][16])

                # Week 1 (Target)
                cell_I11 = ws.cell(row=11, column=9)
                cell_I11.number_format = '@'
                cell_I11.value = safe_int(rows[0][4])

                # Week 2 (Target)
                cell_J11 = ws.cell(row=11, column=10)
                cell_J11.number_format = '@'
                cell_J11.value = safe_int(rows[0][6])

                # Week 3 (Target)
                cell_K11 = ws.cell(row=11, column=11)
                cell_K11.number_format = '@'
                cell_K11.value = safe_int(rows[0][8])

                # Week 4 (Target)
                cell_L11 = ws.cell(row=11, column=12)
                cell_L11.number_format = '@'
                cell_L11.value = safe_int(rows[0][10])

                # Week 5 (Target)
                cell_M11 = ws.cell(row=11, column=13)
                cell_M11.number_format = '@'
                cell_M11.value = safe_int(rows[0][12])

                # Monthly (Actual)
                cell_E11 = ws.cell(row=11, column=5)
                cell_E11.number_format = '@'
                cell_E11.value = safe_int(rows[0][13])

                # Monthly (Target)
                cell_F11 = ws.cell(row=11, column=6)
                cell_F11.number_format = '@'
                cell_F11.value = safe_int(rows[0][14])

                # Monthly (Achievement)
                cell_G11 = ws.cell(row=11, column=7)
                cell_G11.number_format = '@'
                cell_G11.value = safe_int(rows[0][13]) - safe_int(rows[0][14])


             #------ Micky Production Report TCF------

                # Update Daily Plan(Target)
                cell_N12 = ws.cell(row=12, column=14)
                cell_N12.number_format = '@'
                cell_N12.value = safe_int(rows1[0][1])

                # Update Daily Plan(Production)
                cell_O12 = ws.cell(row=12, column=15)
                cell_O12.number_format = '@'
                cell_O12.value = safe_int(rows1[0][2])

                # Update Daily Plan(Achievement)
                cell_P12 = ws.cell(row=12, column=16)
                cell_P12.number_format = '@'
                cell_P12.value = safe_int(rows1[0][1]) - safe_int(rows1[0][2])

                # MTD(Month To Date Actual)
                cell_Q12 = ws.cell(row=12, column=17)
                cell_Q12.number_format = '@'
                cell_Q12.value = safe_int(rows1[0][17])

                # MTD(Month To Date Target)
                cell_R12 = ws.cell(row=12, column=18)
                cell_R12.number_format = '@'
                cell_R12.value = safe_int(rows1[0][18])

                # MTD(Month To Date Achievement)
                cell_S12 = ws.cell(row=12, column=19)
                cell_S12.number_format = '@'
                cell_S12.value = safe_int(rows1[0][17]) - safe_int(rows1[0][18])

                # YTD(Year To Date Target)
                cell_T12 = ws.cell(row=12, column=20)
                cell_T12.number_format = '@'
                cell_T12.value = safe_int(rows1[0][20])

                # FY(FY Year Target)
                cell_U12 = ws.cell(row=12, column=21)
                cell_U12.number_format = '@'
                cell_U12.value = safe_int(rows1[0][16])

                # Week 1 (Target)
                cell_I12 = ws.cell(row=12, column=9)
                cell_I12.number_format = '@'
                cell_I12.value = safe_int(rows1[0][4])

                # Week 2 (Target)
                cell_J12 = ws.cell(row=12, column=10)
                cell_J12.number_format = '@'
                cell_J12.value = safe_int(rows1[0][6])

                # Week 3 (Target)
                cell_K12 = ws.cell(row=12, column=11)
                cell_K12.number_format = '@'
                cell_K12.value = safe_int(rows1[0][8])

                # Week 4 (Target)
                cell_L12 = ws.cell(row=12, column=12)
                cell_L12.number_format = '@'
                cell_L12.value = safe_int(rows1[0][10])

                # Week 5 (Target)
                cell_M12 = ws.cell(row=12, column=13)
                cell_M12.number_format = '@'
                cell_M12.value = safe_int(rows1[0][12])

                # Monthly (Actual)
                cell_E12 = ws.cell(row=12, column=5)
                cell_E12.number_format = '@'
                cell_E12.value = safe_int(rows1[0][13])

                # Monthly (Target)
                cell_F12 = ws.cell(row=12, column=6)
                cell_F12.number_format = '@'
                cell_F12.value = safe_int(rows1[0][14])

                # Monthly (Achievement)
                cell_G12 = ws.cell(row=12, column=7)
                cell_G12.number_format = '@'
                cell_G12.value = safe_int(rows1[0][13]) - safe_int(rows1[0][14])


            #------ Saarthi Production Report BIW------
                # Update Daily Plan(Production)
                cell_N18 = ws.cell(row=18, column=14)
                cell_N18.number_format = '@'
                cell_N18.value = safe_int(rows2[0][2])


                # Week 1 (Production)
                cell_I18 = ws.cell(row=18, column=9)
                cell_I18.number_format = '@'
                cell_I18.value = safe_int(rows2[0][4])

                # Week 2 (Production)
                cell_J18 = ws.cell(row=18, column=10)
                cell_J18.number_format = '@'
                cell_J18.value = safe_int(rows2[0][6])

                # Week 3 (Production)
                cell_K18 = ws.cell(row=18, column=11)
                cell_K18.number_format = '@'
                cell_K18.value = safe_int(rows2[0][8])

                # Week 4 (Production)
                cell_L18 = ws.cell(row=18, column=12)
                cell_L18.number_format = '@'
                cell_L18.value = safe_int(rows2[0][10])

                # Week 5 (Production)
                cell_M18 = ws.cell(row=18, column=13)
                cell_M18.number_format = '@'
                cell_M18.value = safe_int(rows2[0][12])

                # MTD (Month To Date Actual)
                cell_G18 = ws.cell(row=18, column=7)
                cell_G18.number_format = '@'
                cell_G18.value = safe_int(rows2[0][18])

                # Monthly (Actual)
                cell_E18 = ws.cell(row=18, column=5)
                cell_E18.number_format = '@'
                cell_E18.value = safe_int(rows2[0][14])

                # FY Year (Actual)
                cell_C18 = ws.cell(row=18, column=3)
                cell_C18.number_format = '@'
                cell_C18.value = safe_int(rows2[0][16])
                


            #------ Micky Production Report BIW----------------------
                # Update Daily Plan(Production)
                cell_O18 = ws.cell(row=18, column=15)
                cell_O18.number_format = '@'
                cell_O18.value = safe_int(rows3[0][2])


                # Week 1 (Production)
                cell_I21 = ws.cell(row=21, column=9)
                cell_I21.number_format = '@'
                cell_I21.value = safe_int(rows3[0][4])

                # Week 2 (Production)
                cell_J21 = ws.cell(row=21, column=10)
                cell_J21.number_format = '@'
                cell_J21.value = safe_int(rows3[0][6])

                # Week 3 (Production)
                cell_K21 = ws.cell(row=21, column=11)
                cell_K21.number_format = '@'
                cell_K21.value = safe_int(rows3[0][8])

                # Week 4 (Production)
                cell_L21 = ws.cell(row=21, column=12)
                cell_L21.number_format = '@'
                cell_L21.value = safe_int(rows3[0][10])

                # Week 5 (Production)
                cell_M21 = ws.cell(row=21, column=13)
                cell_M21.number_format = '@'
                cell_M21.value = safe_int(rows3[0][12])

                # MTD (Month To Date Actual)
                cell_H18 = ws.cell(row=18, column=8)
                cell_H18.number_format = '@'
                cell_H18.value = safe_int(rows3[0][18])

                # Monthly (Actual)
                cell_F18 = ws.cell(row=18, column=6)
                cell_F18.number_format = '@'
                cell_F18.value = safe_int(rows3[0][14])

                # FY Year (Actual)
                cell_D18 = ws.cell(row=18, column=4)
                cell_D18.number_format = '@'
                cell_D18.value = safe_int(rows3[0][16])
                

            

        

        # 7. Save and return workbook
        wb.save(output_path)

        return {
            "status": "success",
            "filepath": str(output_path),
            "filename": output_path.name
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/open-file")
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


@router.post("/open-folder")
def open_folder_endpoint(payload: OpenFileRequest):
    try:
        path = os.path.abspath(payload.filepath)
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="File not found")
        
        if os.name == "nt":
            # Highlight the file in Explorer
            subprocess.Popen(f'explorer /select,"{path}"')
        else:
            parent = os.path.dirname(path)
            opener = "open" if sys.platform == "darwin" else "xdg-open"
            subprocess.call([opener, parent])
            
        return {"status": "success", "message": "Folder opened successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))