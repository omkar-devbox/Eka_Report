from fastapi import APIRouter, Depends, HTTPException
import pyodbc
from app.core.database import get_db_connection

router = APIRouter()


@router.get("/health")
def health_check(conn: pyodbc.Connection = Depends(get_db_connection)):
    """
    Health check endpoint to verify that the API server is active
    and can connect to the Microsoft SQL Server database using pyodbc.
    """
    try:
        # Create a cursor and execute a test query
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        row = cursor.fetchone()
        cursor.close()

        if row and row[0] == 1:
            return {
                "status": "healthy",
                "database": "connected",
                "message": "Application and database are operating normally."
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Database query returned an unexpected result."
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )
