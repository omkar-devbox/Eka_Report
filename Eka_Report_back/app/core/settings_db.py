import sqlite3
import json
from app.core.auth_db import get_auth_db

def get_smtp_settings() -> dict:
    """Fetch SMTP settings from SQLite database (always row with ID=1)."""
    conn = get_auth_db()
    try:
        row = conn.execute("SELECT * FROM smtp_settings WHERE id = 1").fetchone()
        return dict(row) if row else {}
    finally:
        conn.close()

def update_smtp_settings(**kwargs) -> dict:
    """Update SMTP settings dynamically and return the updated record."""
    conn = get_auth_db()
    try:
        fields = []
        values = []
        for key, value in kwargs.items():
            fields.append(f"{key} = ?")
            values.append(value)
        if fields:
            query = f"UPDATE smtp_settings SET {', '.join(fields)} WHERE id = 1"
            conn.execute(query, tuple(values))
            conn.commit()
        row = conn.execute("SELECT * FROM smtp_settings WHERE id = 1").fetchone()
        return dict(row) if row else {}
    finally:
        conn.close()

def get_all_schedules() -> list[dict]:
    """Retrieve all schedules from SQLite, parsing JSON columns."""
    conn = get_auth_db()
    try:
        rows = conn.execute("SELECT * FROM schedules").fetchall()
        result = []
        for r in rows:
            d = dict(r)
            # Deserialize JSON columns
            try:
                d["recipients"] = json.loads(d["recipients"])
            except Exception:
                d["recipients"] = []
            try:
                d["days"] = json.loads(d["days"]) if d["days"] else []
            except Exception:
                d["days"] = []
            # Convert active to boolean
            d["active"] = bool(d["active"])
            result.append(d)
        return result
    finally:
        conn.close()

def get_schedule_by_id(schedule_id: str) -> dict | None:
    """Retrieve a schedule by ID, parsing JSON columns."""
    conn = get_auth_db()
    try:
        row = conn.execute("SELECT * FROM schedules WHERE id = ?", (schedule_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        try:
            d["recipients"] = json.loads(d["recipients"])
        except Exception:
            d["recipients"] = []
        try:
            d["days"] = json.loads(d["days"]) if d["days"] else []
        except Exception:
            d["days"] = []
        d["active"] = bool(d["active"])
        return d
    finally:
        conn.close()

def create_schedule(
    id: str,
    name: str,
    report_type: str,
    recipients: list[str],
    frequency: str,
    days: list[str],
    time_val: str,
    active: bool
) -> dict:
    """Create a new schedule in the database and return it."""
    conn = get_auth_db()
    try:
        conn.execute(
            """
            INSERT INTO schedules (id, name, report_type, recipients, frequency, days, time, active, last_run, last_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Never', 'idle')
            """,
            (
                id,
                name,
                report_type,
                json.dumps(recipients),
                frequency,
                json.dumps(days) if days else "[]",
                time_val,
                1 if active else 0
            )
        )
        conn.commit()
        return get_schedule_by_id(id)
    finally:
        conn.close()

def update_schedule(schedule_id: str, **kwargs) -> dict | None:
    """Update an existing schedule record dynamically and return it."""
    conn = get_auth_db()
    try:
        fields = []
        values = []
        for key, value in kwargs.items():
            if key == "recipients":
                fields.append("recipients = ?")
                values.append(json.dumps(value))
            elif key == "days":
                fields.append("days = ?")
                values.append(json.dumps(value) if value is not None else "[]")
            elif key == "active":
                fields.append("active = ?")
                values.append(1 if value else 0)
            elif key == "time":
                fields.append("time = ?")
                values.append(value)
            else:
                fields.append(f"{key} = ?")
                values.append(value)
        if fields:
            values.append(schedule_id)
            query = f"UPDATE schedules SET {', '.join(fields)} WHERE id = ?"
            conn.execute(query, tuple(values))
            conn.commit()
        return get_schedule_by_id(schedule_id)
    finally:
        conn.close()

def delete_schedule(schedule_id: str) -> bool:
    """Delete a schedule by ID."""
    conn = get_auth_db()
    try:
        cursor = conn.execute("DELETE FROM schedules WHERE id = ?", (schedule_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
