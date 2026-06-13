import openpyxl
import os

def check_images(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    print(f"Checking images in: {file_path}")
    wb = openpyxl.load_workbook(file_path)
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        images = getattr(ws, "_images", [])
        print(f"  Sheet: {sheet_name} - Number of images: {len(images)}")
        for i, img in enumerate(images):
            print(f"    Image {i+1}: {type(img)}")

check_images("ProductionReport_R3.xlsx")
check_images("Loss Report_R2.xlsx")
check_images("MProductionReport.xlsx")
