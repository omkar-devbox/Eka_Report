import pyodbc

drivers = pyodbc.drivers()
print("Available Drivers:", drivers)

servers = [
    'localhost',
    '(local)',
    '.\\SQLEXPRESS',
    '(local)\\SQLEXPRESS',
    'DESKTOP-M3NKTR9',
    'DESKTOP-M3NKTR9\\SQLEXPRESS'
]

for driver in ['ODBC Driver 17 for SQL Server', 'ODBC Driver 18 for SQL Server']:
    if driver not in drivers:
        continue
    print(f"\n--- Testing with {driver} ---")
    for s in servers:
        print(f"Trying server: '{s}' ...")
        # Try Windows Authentication (Trusted Connection)
        try:
            conn = pyodbc.connect(
                f"DRIVER={{{driver}}};SERVER={s};DATABASE=master;Trusted_Connection=yes;TrustServerCertificate=yes;",
                timeout=3
            )
            print(f"  SUCCESS (Trusted_Connection)!")
            conn.close()
        except Exception as e:
            err_msg = str(e).split('\n')[0]
            print(f"  FAILED (Trusted_Connection): {err_msg}")
        
        # Try SQL Server Authentication with the username
        try:
            conn = pyodbc.connect(
                f"DRIVER={{{driver}}};SERVER={s};DATABASE=master;UID=DESKTOP-M3NKTR9\\ANIKET;PWD=;TrustServerCertificate=yes;",
                timeout=3
            )
            print(f"  SUCCESS (SQL Auth UID/PWD)!")
            conn.close()
        except Exception as e:
            err_msg = str(e).split('\n')[0]
            print(f"  FAILED (SQL Auth UID/PWD): {err_msg}")
