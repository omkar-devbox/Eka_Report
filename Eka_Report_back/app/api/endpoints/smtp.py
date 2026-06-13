from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.core.deps import get_current_user, require_role
from app.core.settings_db import get_smtp_settings, update_smtp_settings
from app.core.mailer import send_report_email

router = APIRouter(prefix="/api/settings/smtp", tags=["SMTP Settings"])

class SmtpSettingsUpdate(BaseModel):
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    smtp_secure: str
    sender_email: str
    sender_name: str
    subject_template: str
    body_template: str

class SmtpTestRequest(BaseModel):
    recipient_email: str

@router.get("")
def get_smtp(current_user: dict = Depends(get_current_user)):
    """
    Retrieve SMTP configuration. Masks the password if the user is a viewer.
    """
    settings_data = get_smtp_settings()
    if not settings_data:
        raise HTTPException(status_code=404, detail="SMTP settings not initialized.")
        
    if current_user.get("role") not in ["admin", "editor"]:
        settings_data["smtp_password"] = "********"
    return settings_data

@router.put("")
def update_smtp(payload: SmtpSettingsUpdate, current_user: dict = Depends(require_role("admin", "editor"))):
    """
    Update SMTP configuration settings (admin/editor only).
    """
    updated = update_smtp_settings(
        smtp_host=payload.smtp_host.strip(),
        smtp_port=payload.smtp_port,
        smtp_username=payload.smtp_username.strip(),
        smtp_password=payload.smtp_password,  # preserve original spaces if any
        smtp_secure=payload.smtp_secure.strip(),
        sender_email=payload.sender_email.strip(),
        sender_name=payload.sender_name.strip(),
        subject_template=payload.subject_template,
        body_template=payload.body_template
    )
    return updated

@router.post("/test")
def test_smtp(payload: SmtpTestRequest, current_user: dict = Depends(require_role("admin", "editor"))):
    """
    Trigger a test email dispatch using the saved SMTP credentials (admin/editor only).
    """
    try:
        send_report_email(
            recipients=[payload.recipient_email.strip()],
            subject="[Eka Studio] SMTP Test Connection",
            body="Congratulations! Your SMTP mailing gateway settings have been successfully verified and connected in Eka Report Studio.",
            attachment_path=None,
            attachment_name=None
        )
        return {"status": "success", "message": f"Test email sent successfully to {payload.recipient_email}!"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SMTP Gateway Test Connection Failed: {str(e)}"
        )
