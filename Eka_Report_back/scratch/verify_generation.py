import sys
import os
from pathlib import Path

# Add backend root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.schemas.mgmt_prod_report import ProdReportType2Request
from app.api.ProdReportType2.prod_report_type2 import generate_mgmt_production_report
from app.core.database import get_db_connection
import openpyxl

# Setup request payload
payload = ProdReportType2Request(
    ReportDate="2026-06-13",
    StartDate="2026-04-01",
    LastDate="2027-03-31",
    Shift="A",
    Email=None
)

# Connect to database and run generation
conn = get_db_connection()
try:
    print("Generating report directly via backend code...")
    result = generate_mgmt_production_report(payload, conn)
    print("Generation result:", result)
    
    filepath = result["filepath"]
    if os.path.exists(filepath):
        print(f"File generated successfully at: {filepath}")
        wb = openpyxl.load_workbook(filepath)
        for sname in wb.sheetnames:
            ws = wb[sname]
            images = getattr(ws, "_images", [])
            print(f"  Sheet: {sname} - Number of images: {len(images)}")
    else:
        print("Error: Generated file not found!")
finally:
    conn.close()
