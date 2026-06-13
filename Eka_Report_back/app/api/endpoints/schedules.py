from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import threading
from app.core.deps import get_current_user, require_role
from app.core.settings_db import (
    get_all_schedules,
    get_schedule_by_id,
    create_schedule,
    update_schedule,
    delete_schedule
)
from app.core.scheduler import run_schedule_job_safely

router = APIRouter(prefix="/api/schedules", tags=["Schedules"])

class ScheduleCreate(BaseModel):
    id: str
    name: str
    report_type: str
    recipients: List[str]
    frequency: str
    days: List[str]
    time: str
    active: bool

class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    report_type: Optional[str] = None
    recipients: Optional[List[str]] = None
    frequency: Optional[str] = None
    days: Optional[List[str]] = None
    time: Optional[str] = None
    active: Optional[bool] = None

@router.get("")
def list_schedules(current_user: dict = Depends(get_current_user)):
    """
    List all report schedules.
    """
    return get_all_schedules()

@router.post("", status_code=status.HTTP_201_CREATED)
def add_schedule(payload: ScheduleCreate, current_user: dict = Depends(require_role("admin", "editor"))):
    """
    Create a new report compilation schedule (admin/editor only).
    """
    existing = get_schedule_by_id(payload.id)
    if existing:
        raise HTTPException(status_code=400, detail="Schedule ID already exists")
    
    new_sched = create_schedule(
        id=payload.id,
        name=payload.name.strip(),
        report_type=payload.report_type.strip(),
        recipients=payload.recipients,
        frequency=payload.frequency.strip(),
        days=payload.days,
        time_val=payload.time.strip(),
        active=payload.active
    )
    return new_sched

@router.put("/{schedule_id}")
def edit_schedule(schedule_id: str, payload: ScheduleUpdate, current_user: dict = Depends(require_role("admin", "editor"))):
    """
    Modify an existing schedule config (admin/editor only).
    """
    existing = get_schedule_by_id(schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    update_data = {}
    if payload.name is not None:
        update_data["name"] = payload.name.strip()
    if payload.report_type is not None:
        update_data["report_type"] = payload.report_type.strip()
    if payload.recipients is not None:
        update_data["recipients"] = payload.recipients
    if payload.frequency is not None:
        update_data["frequency"] = payload.frequency.strip()
    if payload.days is not None:
        update_data["days"] = payload.days
    if payload.time is not None:
        update_data["time"] = payload.time.strip()
    if payload.active is not None:
        update_data["active"] = payload.active
        
    updated = update_schedule(schedule_id, **update_data)
    return updated

@router.delete("/{schedule_id}")
def remove_schedule(schedule_id: str, current_user: dict = Depends(require_role("admin", "editor"))):
    """
    Delete a schedule by ID (admin/editor only).
    """
    existing = get_schedule_by_id(schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    delete_schedule(schedule_id)
    return {"message": "Schedule deleted successfully"}

@router.post("/{schedule_id}/run")
def trigger_schedule(schedule_id: str, current_user: dict = Depends(require_role("admin", "editor"))):
    """
    Manually compile and dispatch the scheduled report immediately in the background (admin/editor only).
    """
    existing = get_schedule_by_id(schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    # Trigger execution in a background thread to prevent API request timeout
    t = threading.Thread(target=run_schedule_job_safely, args=(schedule_id,), daemon=True)
    t.start()
    
    return {"status": "success", "message": f"Schedule '{existing['name']}' triggered successfully in the background."}
