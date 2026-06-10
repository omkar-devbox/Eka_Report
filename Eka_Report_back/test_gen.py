import sys
import os
import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db_connection
from app.schemas.mgmt_prod_report import MgmtProdReportRequest
from app.api.MgmtProdReport.mgmt_prod_report import generate_mgmt_production_report

def main():
    print("Initializing test run...")
    # Mock payload for report generation
    # Today is June 9, 2026. The FY is April 1, 2026 to March 31, 2027.
    payload = MgmtProdReportRequest(
        ReportDate="2026-05-26",
        StartDate="2026-04-01",
        LastDate="2027-03-31",
        Shift="A"
    )
    
    gen = get_db_connection()
    conn = next(gen)
    
    try:
        print("Generating report...")
        result = generate_mgmt_production_report(payload, conn)
        print("Success:", result)
        
        # Open and inspect the generated Excel sheet
        import openpyxl
        fpath = result["filepath"]
        wb = openpyxl.load_workbook(fpath, data_only=False)
        
        print("\n--- Inspecting Manag Report ---")
        ws_man = wb["Manag Report"]
        print("Row 34 (Chassis Production Daily):")
        print("Shift (D34):", ws_man["D34"].value)
        print("Shift Start Time (E34):", ws_man["E34"].value)
        print("Shift End Time (F34):", ws_man["F34"].value)
        print("Shift Time (G34):", ws_man["G34"].value)
        print("Plan Down Time (H34):", ws_man["H34"].value)
        print("Production Count (I34):", ws_man["I34"].value)
        print("Station Availability Formula (J34):", ws_man["J34"].value)
        
        print("\n--- Inspecting Chassis Line Status (CH-10 to CH-60) ---")
        for r in range(38, 44):
            vals = [ws_man.cell(row=r, column=c).value for c in range(1, 9)]
            print(f"Row {r}: {vals}")

        # Also print data_only=True to evaluate J34 if possible (though openpyxl does not evaluate formulas dynamically)
        
    except Exception as err:
        print("Error occurred:", err)
    finally:
        try:
            next(gen)
        except StopIteration:
            pass

if __name__ == "__main__":
    main()
