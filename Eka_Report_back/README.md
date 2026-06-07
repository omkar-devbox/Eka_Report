# FastAPI MS SQL Base Project

A production-ready FastAPI base project template configured with Microsoft SQL Server connection using raw `pyodbc` database connections directly.

## Project Structure

```text
├── .env                  # Environment configurations (ignored by git)
├── .env.example          # Sample environment configurations template
├── .gitignore            # Git ignore file
├── requirements.txt      # Python dependencies
├── README.md             # Project documentation
├── app/                  # Application source code
│   ├── __init__.py
│   ├── main.py           # FastAPI entrypoint
│   ├── api/              # API layer
│   │   ├── __init__.py
│   │   └── endpoints/    # Router endpoints (e.g. health)
│   │       ├── __init__.py
│   │       └── health.py
│   ├── core/             # Core configurations
│   │   ├── __init__.py
│   │   ├── config.py     # Pydantic Settings
│   │   └── database.py   # Raw pyodbc connection dependency manager
│   ├── models/           # Database models
│   │   └── __init__.py
│   └── schemas/          # Pydantic schemas (request/response validation)
│       └── __init__.py
```

## Setup & Installation

### 1. Prerequisites
- Python 3.8+ (Supports up to Python 3.14)
- Microsoft SQL Server
- [Microsoft ODBC Driver for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server) installed on your system (e.g., version 17 or 18).

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your MS SQL database credentials:
```bash
copy .env.example .env
```

Ensure `DB_DRIVER` in `.env` matches the ODBC driver name installed on your system (usually `"ODBC Driver 17 for SQL Server"` or `"ODBC Driver 18 for SQL Server"`).

### 3. Install Dependencies

You can install the requirements inside the virtual environment.

If your system execution policy prevents activating the virtual environment, you can bypass the policy for the current session or run python directly:

**Option A: Temporarily bypass execution policy & activate**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Option B: Install packages directly (No activation required)**
```powershell
.\venv\Scripts\python -m pip install -r requirements.txt
```

## Running the Application

Start the local development server. You can run the server directly using the virtual environment's python executor, bypassing any activation policies:
```powershell

.\venv\Scripts\Activate.ps1 
.\venv\Scripts\python -m uvicorn app.main:app --reload
```

By default, the server will start at `http://127.0.0.1:8000`.

### API Documentation
- **Swagger UI (Interactive Docs)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc (Alternative Docs)**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Check Health and Connectivity
Run a GET request to `http://127.0.0.1:8000/health`. This endpoint will query the database to ensure connection is working.
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "Application and database are operating normally."
}
```
