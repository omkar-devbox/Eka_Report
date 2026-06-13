import time
import datetime
import threading
import traceback
import pyodbc
from app.core.config import settings
from app.core.settings_db import get_all_schedules, get_schedule_by_id, update_schedule, get_smtp_settings
from app.core.mailer import send_report_email, get_financial_year_dates

# Global registry to track last run minutes to prevent duplicate executions (key: schedule_id, val: minute string)
_last_run_minutes = {}

def run_schedule_job_safely(schedule_id: str):
    """
    Executes a scheduled job by opening SQL Server connection, compiling the appropriate
    Excel sheet template, sending out the email with the attachment, and updating statuses.
    """
    schedule = get_schedule_by_id(schedule_id)
    if not schedule:
        print(f"Scheduler: Job ID {schedule_id} not found in database.")
        return
    
    # Format and save start run timestamp
    time_stamp_str = datetime.datetime.now().strftime("%d-%b-%Y %I:%M %p")
    update_schedule(schedule_id, last_run=time_stamp_str, last_status="running")
    
    print(f"Scheduler: Starting execution of schedule '{schedule['name']}' (ID: {schedule_id}).")
    
    conn = None
    try:
        # 1. Connect to Microsoft SQL Server
        conn = pyodbc.connect(settings.ODBC_CONNECTION_STRING)
        
        # 2. Get dates
        today = datetime.date.today()
        report_date_str = today.strftime("%Y-%m-%d")
        start_date_str, last_date_str = get_financial_year_dates(today)
        
        # 3. Determine Shift
        shift_val = "A"
        name_lower = schedule["name"].lower()
        if "shift b" in name_lower:
            shift_val = "B"
        elif "shift c" in name_lower:
            shift_val = "C"
        elif "shift d" in name_lower:
            shift_val = "D"
            
        # 4. Generate report in-process
        attachment_path = None
        attachment_name = None
        
        if schedule["report_type"] == "R2":
            from app.api.MgmtProdReport.mgmt_prod_report import generate_mgmt_production_report as run_r2
            from app.schemas.mgmt_prod_report import MgmtProdReportRequest
            payload = MgmtProdReportRequest(
                ReportDate=report_date_str,
                StartDate=start_date_str,
                LastDate=last_date_str,
                Shift=shift_val
            )
            res = run_r2(payload, conn)
            attachment_path = res["filepath"]
            attachment_name = res["filename"]
        else:
            from app.api.ProdReportType2.prod_report_type2 import generate_mgmt_production_report as run_r3
            from app.schemas.mgmt_prod_report import ProdReportType2Request
            payload = ProdReportType2Request(
                ReportDate=report_date_str,
                StartDate=start_date_str,
                LastDate=last_date_str,
                Shift=shift_val
            )
            res = run_r3(payload, conn)
            attachment_path = res["filepath"]
            attachment_name = res["filename"]
            
        # 5. Format templates
        smtp_info = get_smtp_settings()
        subject_template = smtp_info.get("subject_template", "[Eka Studio] {ReportType} - {Date}")
        body_template = smtp_info.get("body_template", "Please find attached the compiled {ReportType} for {Date} (Shift: {Shift}).")
        
        report_desc = "Management Report (R2)" if schedule["report_type"] == "R2" else "Production Report (R3)"
        
        def resolve_placeholders(text: str) -> str:
            if not text:
                return ""
            return (
                text.replace("{Date}", today.strftime("%b %d, %Y"))
                .replace("{ReportType}", report_desc)
                .replace("{Shift}", shift_val)
                .replace("{UserName}", "Eka Report Studio")
            )
            
        subject = resolve_placeholders(subject_template)
        body = resolve_placeholders(body_template)
        
        # 6. Dispatch email
        send_report_email(
            recipients=schedule["recipients"],
            subject=subject,
            body=body,
            attachment_path=attachment_path,
            attachment_name=attachment_name
        )
        
        # 7. Update status to success
        update_schedule(schedule_id, last_status="success")
        print(f"Scheduler: Successfully completed run and sent mail for schedule '{schedule['name']}'.")
        
    except Exception as e:
        print(f"Scheduler ERROR executing job {schedule_id}: {str(e)}")
        traceback.print_exc()
        update_schedule(schedule_id, last_status="failed")
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

def _scheduler_loop():
    """
    Main thread runner loop checking database schedules every 15 seconds.
    """
    print("Scheduler background loop started successfully.")
    while True:
        try:
            now = datetime.datetime.now()
            current_time_str = now.strftime("%H:%M")
            current_day = now.strftime("%a")  # e.g., 'Mon', 'Tue'
            
            schedules = get_all_schedules()
            for s in schedules:
                if not s["active"]:
                    continue
                
                # Check if schedule time matches HH:MM
                if s["time"] != current_time_str:
                    continue
                
                # Prevent duplicate execution within the same minute
                minute_key = now.strftime("%Y-%m-%d %H:%M")
                if _last_run_minutes.get(s["id"]) == minute_key:
                    continue
                
                # Check frequency rules
                should_run = False
                freq = s["frequency"]
                
                if freq == "daily":
                    should_run = True
                elif freq == "weekly":
                    if current_day in s["days"]:
                        should_run = True
                elif freq == "monthly":
                    # Default: run on the first day of the calendar month
                    if now.day == 1:
                        should_run = True
                
                if should_run:
                    _last_run_minutes[s["id"]] = minute_key
                    # Spawn in a separate daemon thread to avoid blocking the main scheduler check loop
                    t = threading.Thread(target=run_schedule_job_safely, args=(s["id"],), daemon=True)
                    t.start()
                    
        except Exception as e:
            print(f"Scheduler check loop encountered error: {str(e)}")
            
        time.sleep(15)

def start_scheduler():
    """Start the scheduler background check thread."""
    t = threading.Thread(target=_scheduler_loop, name="EkaReportScheduler", daemon=True)
    t.start()
