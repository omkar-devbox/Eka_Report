import smtplib
import os
import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from app.core.settings_db import get_smtp_settings

def get_financial_year_dates(report_date: datetime.date) -> tuple[str, str]:
    """
    Calculate the start and end date of the financial year for a given date.
    Financial Year runs from April 1 to March 31.
    """
    if report_date.month >= 4:
        fy_start_year = report_date.year
    else:
        fy_start_year = report_date.year - 1
        
    start_date = datetime.date(fy_start_year, 4, 1).strftime("%Y-%m-%d")
    last_date = datetime.date(fy_start_year + 1, 3, 31).strftime("%Y-%m-%d")
    return start_date, last_date

def send_report_email(recipients: list[str], subject: str, body: str, attachment_path: str = None, attachment_name: str = None):
    """
    Send an email with optional file attachment using configured SMTP server credentials.
    """
    if not recipients:
        raise ValueError("No recipient emails specified.")
        
    smtp_info = get_smtp_settings()
    
    host = smtp_info.get("smtp_host", "smtp.office365.com")
    port = smtp_info.get("smtp_port", 587)
    user = smtp_info.get("smtp_username", "")
    password = smtp_info.get("smtp_password", "")
    secure = smtp_info.get("smtp_secure", "tls")
    sender_email = smtp_info.get("sender_email", "reports@ekareport.com")
    sender_name = smtp_info.get("sender_name", "Eka Operations Hub")
    
    # Create email message envelope
    msg = MIMEMultipart()
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = subject
    
    msg.attach(MIMEText(body, "plain"))
    
    # Attach file if path exists
    if attachment_path and os.path.exists(attachment_path):
        filename = attachment_name or os.path.basename(attachment_path)
        with open(attachment_path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f"attachment; filename= {filename}",
        )
        msg.attach(part)
        
    # Connect and send
    if secure == "ssl":
        server = smtplib.SMTP_SSL(host, port, timeout=15)
        if user and password:
            server.login(user, password)
        server.sendmail(sender_email, recipients, msg.as_string())
        server.quit()
    elif secure == "tls":
        server = smtplib.SMTP(host, port, timeout=15)
        server.starttls()
        if user and password:
            server.login(user, password)
        server.sendmail(sender_email, recipients, msg.as_string())
        server.quit()
    else:
        server = smtplib.SMTP(host, port, timeout=15)
        if user and password:
            server.login(user, password)
        server.sendmail(sender_email, recipients, msg.as_string())
        server.quit()
