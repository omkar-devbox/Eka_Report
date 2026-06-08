import sys
import os

# Add the directory to python path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import pyodbc
except ImportError:
    print("Error: pyodbc is not installed in the current Python environment.")
    print("Please activate your virtual environment and run: pip install pyodbc")
    sys.exit(1)

# Try importing from the app, load settings
try:
    from app.core.config import settings
except ImportError as err:
    print(f"Error importing app configuration: {err}")
    print("Ensure you are running the script from the 'Eka_Report_back' directory.")
    sys.exit(1)

# List to accumulate logs to write to env.txt
log_lines = []

def log(message=""):
    print(message)
    log_lines.append(message)

def test_connection():
    log("=" * 60)
    log("EKA Report - Database Connection Test Tool")
    log("=" * 60)
    
    # 1. Check installed ODBC drivers
    log("\n[1] Checking installed ODBC drivers on this machine...")
    drivers = pyodbc.drivers()
    if not drivers:
        log("    WARNING: No ODBC drivers found! You may need to install Microsoft ODBC Driver for SQL Server.")
    else:
        log("    Available ODBC Drivers:")
        for driver in drivers:
            log(f"    - {driver}")
            
    # 2. Print configured database settings
    log("\n[2] Database configuration loaded from environment (.env):")
    log(f"    - DB_SERVER:                     {settings.DB_SERVER}")
    log(f"    - DB_PORT:                       {settings.DB_PORT or 'Default'}")
    log(f"    - DB_DATABASE:                   {settings.DB_DATABASE}")
    log(f"    - DB_DRIVER:                     {settings.DB_DRIVER}")
    log(f"    - DB_TRUSTED_CONNECTION:         {settings.DB_TRUSTED_CONNECTION}")
    log(f"    - DB_USERNAME:                   {settings.DB_USERNAME}")
    log(f"    - DB_PASSWORD:                   {settings.DB_PASSWORD if settings.DB_PASSWORD else 'None'}")
    log(f"    - DB_TRUST_SERVER_CERTIFICATE:   {settings.DB_TRUST_SERVER_CERTIFICATE}")
    log(f"    - DB_ENCRYPT:                    {settings.DB_ENCRYPT}")

    # Build connection string
    conn_str = settings.ODBC_CONNECTION_STRING
    log(f"\n    Raw Connection String:\n    {conn_str}")

    # 3. Attempt Connection
    log("\n[3] Attempting database connection...")
    success = False
    try:
        conn = pyodbc.connect(conn_str, timeout=5)
        log("    SUCCESS: Connected to database successfully!")
        
        cursor = conn.cursor()
        
        # Test 1: Get Server Version
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()
        if version:
            log(f"\n    SQL Server Version:\n    {version[0].strip()}")
            
        # Test 2: Get Current Database name
        cursor.execute("SELECT DB_NAME()")
        current_db = cursor.fetchone()
        if current_db:
            log(f"    Connected Database: {current_db[0]}")
            
        # Test 3: List tables to verify permissions/schema
        log("\n    Checking required tables in database...")
        required_tables = ['LineStopRecord', 'Production_Loss', 'S_TCF', 'M_TCF']
        
        for table in required_tables:
            try:
                # Check if table exists
                cursor.execute(f"SELECT TOP 1 * FROM dbo.{table}")
                cursor.fetchone()
                log(f"    - [OK] dbo.{table} table is accessible.")
            except Exception as table_err:
                log(f"    - [WARNING] Could not query dbo.{table}: {table_err}")
                
        cursor.close()
        conn.close()
        log("\n" + "=" * 60)
        log("DATABASE TEST PASSED SUCCESSFULLY!")
        log("=" * 60)
        success = True
        
    except Exception as e:
        log("\n    FAILURE: Connection failed!")
        log(f"    Error details: {e}")
        
        log("\n" + "=" * 60)
        log("Troubleshooting Suggestions:")
        log("1. Driver mismatch:")
        if settings.DB_DRIVER not in drivers:
            log(f"   - Configured driver '{settings.DB_DRIVER}' is NOT installed.")
            installed_sql_drivers = [d for d in drivers if "SQL Server" in d or "ODBC Driver" in d]
            if installed_sql_drivers:
                log(f"     Try updating DB_DRIVER in .env to one of the installed ones, e.g.:")
                for d in installed_sql_drivers:
                    log(f"     DB_DRIVER=\"{d}\"")
            else:
                log("     Please install the Microsoft ODBC Driver for SQL Server:")
                log("     https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server")
                
        log("2. Server connectivity:")
        log(f"   - Check if SQL Server is running on '{settings.DB_SERVER}'.")
        log(f"   - Ensure TCP/IP protocol is enabled in SQL Server Configuration Manager.")
        log(f"   - Ensure SQL Server Browser service is running if using named instances.")
        
        log("3. Authentication:")
        if settings.DB_TRUSTED_CONNECTION and settings.DB_TRUSTED_CONNECTION.lower() in ("yes", "true", "1"):
            log("   - Currently using Windows Authentication (Trusted Connection).")
            log("     Ensure the current Windows user has access permission to SQL Server.")
        else:
            log(f"   - Currently using SQL Server Authentication (User: {settings.DB_USERNAME}).")
            log("     Verify database credentials in your .env file.")
        log("=" * 60)
        success = False

    # Write all log lines and test configuration to env.txt
    try:
        env_txt_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "env.txt")
        with open(env_txt_path, "w", encoding="utf-8") as f:
            f.write("=== EKA REPORT LOADED ENVIRONMENT SETTINGS ===\n")
            f.write(f"DB_SERVER={settings.DB_SERVER}\n")
            f.write(f"DB_PORT={settings.DB_PORT or ''}\n")
            f.write(f"DB_DATABASE={settings.DB_DATABASE}\n")
            f.write(f"DB_DRIVER={settings.DB_DRIVER}\n")
            f.write(f"DB_TRUSTED_CONNECTION={settings.DB_TRUSTED_CONNECTION or ''}\n")
            f.write(f"DB_USERNAME={settings.DB_USERNAME or ''}\n")
            f.write(f"DB_PASSWORD={settings.DB_PASSWORD or ''}\n")
            f.write(f"DB_TRUST_SERVER_CERTIFICATE={settings.DB_TRUST_SERVER_CERTIFICATE or ''}\n")
            f.write(f"DB_ENCRYPT={settings.DB_ENCRYPT or ''}\n")
            f.write(f"ODBC_CONNECTION_STRING={conn_str}\n\n")
            
            f.write("=== TEST RUN EXECUTION LOG ===\n")
            f.write("\n".join(log_lines))
            f.write("\n")
        print(f"\n[INFO] Test results and configuration saved to {env_txt_path}")
    except Exception as save_err:
        print(f"\n[WARNING] Could not save log to env.txt: {save_err}")

    return success

if __name__ == "__main__":
    test_connection()
