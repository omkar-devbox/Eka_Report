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
    """Create auth tables if they do not exist."""
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


def create_user(username: str, email: str, full_name: str, hashed_password: str, role: str = "viewer") -> dict:
    """Insert a new user and return the created record."""
    conn = get_auth_db()
    try:
        conn.execute(
            """
            INSERT INTO users (username, email, full_name, hashed_password, role)
            VALUES (?, ?, ?, ?, ?)
            """,
            (username, email, full_name, hashed_password, role),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        return dict(row)
    finally:
        conn.close()
