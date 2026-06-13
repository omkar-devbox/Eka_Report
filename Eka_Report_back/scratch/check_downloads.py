import glob
import os
import openpyxl

downloads_dir = os.path.expanduser("~/Downloads")
files = glob.glob(os.path.join(downloads_dir, "MProductionReport_*.xlsx"))
files.sort(key=os.path.getmtime, reverse=True)

if not files:
    print("No generated reports found in Downloads.")
else:
    print(f"Found {len(files)} generated reports in Downloads. Checking the most recent ones:")
    for f in files[:3]:
        print(f"File: {os.path.basename(f)}")
        try:
            wb = openpyxl.load_workbook(f)
            for sname in wb.sheetnames:
                ws = wb[sname]
                images = getattr(ws, "_images", [])
                if len(images) > 0:
                    print(f"  Sheet: {sname} - Number of images: {len(images)}")
                else:
                    # Just print if it's the expected sheet
                    if sname in ("Prod Report", "Manag Report"):
                        print(f"  Sheet: {sname} - Number of images: 0")
        except Exception as e:
            print(f"  Error loading: {e}")
