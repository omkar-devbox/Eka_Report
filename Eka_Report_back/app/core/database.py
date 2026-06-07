import pyodbc
from typing import Generator
from app.core.config import settings


def get_db_connection() -> Generator[pyodbc.Connection, None, None]:
    """
    Dependency that opens a connection to Microsoft SQL Server using pyodbc,
    yields it to the request handler, and ensures it is closed after the request is finished.
    """
    # pyodbc manages connection pooling implicitly via Windows ODBC Driver Manager configuration
    conn = pyodbc.connect(settings.ODBC_CONNECTION_STRING)
    try:
        yield conn
    finally:
        conn.close()
