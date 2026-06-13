import sqlite3
import os
from pathlib import Path
from app.core.config import settings, BASE_DIR


def get_auth_db_path() -> str:
    """Return the absolute path to the SQLite auth database."""
    return str(BASE_DIR / settings.AUTH_DB_NAME)


def get_auth_db() -> sqlite3.Connection:
    """
    Open a connection to the SQLite auth database.
    Creates the database and users table on first call.
    """
    db_path = get_auth_db_path()
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # Allows dict-style access
    _create_tables(conn)
    return conn


def _create_tables(conn: sqlite3.Connection) -> None:
    """Create auth, smtp, and schedules tables if they do not exist."""
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            username        TEXT    UNIQUE NOT NULL,
            email           TEXT    UNIQUE NOT NULL,
            full_name       TEXT    NOT NULL,
            role            TEXT    NOT NULL DEFAULT 'viewer',
            hashed_password TEXT    NOT NULL,
            is_active       INTEGER NOT NULL DEFAULT 1,
            created_at      TEXT    DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS smtp_settings (
            id                INTEGER PRIMARY KEY CHECK (id = 1),
            smtp_host         TEXT NOT NULL DEFAULT 'smtp.gmail.com',
            smtp_port         INTEGER NOT NULL DEFAULT 587,
            smtp_username     TEXT NOT NULL DEFAULT 'omkarregetest@gmail.com',
            smtp_password     TEXT NOT NULL DEFAULT 'ucfzwkhdwivmumif',
            smtp_secure       TEXT NOT NULL DEFAULT 'tls',
            sender_email      TEXT NOT NULL DEFAULT 'omkarregetest@gmail.com',
            sender_name       TEXT NOT NULL DEFAULT 'Eka Operations Hub',
            subject_template  TEXT NOT NULL DEFAULT '[Eka Studio] {ReportType} - {Date}',
            body_template     TEXT NOT NULL DEFAULT 'Dear Team,

Please find attached the compiled {ReportType} for the date {Date} (Shift: {Shift}).

This is an automated dispatch from Eka Report Studio. Please do not reply directly to this email.

Best Regards,
Eka Operations Hub'
        );

        CREATE TABLE IF NOT EXISTS schedules (
            id            TEXT PRIMARY KEY,
            name          TEXT NOT NULL,
            report_type   TEXT NOT NULL,
            recipients    TEXT NOT NULL,
            frequency     TEXT NOT NULL,
            days          TEXT,
            time          TEXT NOT NULL,
            active        INTEGER NOT NULL DEFAULT 1,
            last_run      TEXT DEFAULT 'Never',
            last_status   TEXT DEFAULT 'idle'
        );
        """
    )
    # Populate default smtp settings if empty
    row = conn.execute("SELECT 1 FROM smtp_settings WHERE id = 1").fetchone()
    if not row:
        conn.execute(
            """
            INSERT INTO smtp_settings (id, smtp_host, smtp_port, smtp_username, smtp_password, smtp_secure, sender_email, sender_name, subject_template, body_template)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, '[Eka Studio] {ReportType} - {Date}', 'Dear Team,

Please find attached the compiled {ReportType} for the date {Date} (Shift: {Shift}).

This is an automated dispatch from Eka Report Studio. Please do not reply directly to this email.

Best Regards,
Eka Operations Hub')
            """,
            (
                settings.SMTP_HOST,
                settings.SMTP_PORT,
                settings.SMTP_MAIL,
                settings.SMTP_PASS,
                settings.SMTP_SECURE,
                settings.SMTP_MAIL,
                'Eka Operations Hub'
            )
        )
    
    # Populate default schedules if schedules table is empty
    row_sched = conn.execute("SELECT 1 FROM schedules LIMIT 1").fetchone()
    if not row_sched:
        conn.executescript(
            """
            INSERT INTO schedules (id, name, report_type, recipients, frequency, days, time, active, last_run, last_status) VALUES
            ('sched-1', 'Shift A Daily Production Summary', 'R3', '["omkarregetest@gmail.com"]', 'daily', '[]', '07:30', 1, 'Never', 'idle'),
            ('sched-2', 'Weekly Management Financial Achievement', 'R2', '["omkarregetest@gmail.com"]', 'weekly', '["Mon"]', '09:00', 1, 'Never', 'idle'),
            ('sched-3', 'Night Shift Production Run Log', 'R3', '["omkarregetest@gmail.com"]', 'daily', '[]', '22:30', 0, 'Never', 'idle');
            """
        )
    conn.commit()


def get_user_by_username(username: str) -> dict | None:
    """Fetch a user record by username. Returns dict or None."""
    conn = get_auth_db()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_user_by_email(email: str) -> dict | None:
    """Fetch a user record by email. Returns dict or None."""
    conn = get_auth_db()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def create_user(
    username: str,
    email: str,
    full_name: str,
    hashed_password: str,
    role: str = "viewer",
    is_active: int = 1,
) -> dict:
    """Insert a new user and return the created record."""
    conn = get_auth_db()
    try:
        conn.execute(
            """
            INSERT INTO users (username, email, full_name, hashed_password, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (username, email, full_name, hashed_password, role, is_active),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        return dict(row)
    finally:
        conn.close()


def get_user_by_id(user_id: int) -> dict | None:
    """Fetch a user record by user ID. Returns dict or None."""
    conn = get_auth_db()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_all_users() -> list[dict]:
    """Fetch all user records from SQLite database."""
    conn = get_auth_db()
    try:
        rows = conn.execute(
            "SELECT * FROM users ORDER BY id ASC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def update_user(user_id: int, **kwargs) -> dict | None:
    """Update a user's details dynamically."""
    conn = get_auth_db()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            return None

        fields = []
        values = []
        for key, value in kwargs.items():
            if value is not None:
                fields.append(f"{key} = ?")
                values.append(value)

        if not fields:
            return dict(user)

        values.append(user_id)
        query = f"UPDATE users SET {', '.join(fields)} WHERE id = ?"
        conn.execute(query, tuple(values))
        conn.commit()

        updated = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(updated) if updated else None
    finally:
        conn.close()


def delete_user(user_id: int) -> bool:
    """Delete a user record by user ID."""
    conn = get_auth_db()
    try:
        cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
