import pyodbc

conn = pyodbc.connect("DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=TRIM_PC;Trusted_Connection=yes;TrustServerCertificate=yes;")
cursor = conn.cursor()

def run_query(DbName, ReportDate):
    query = f"""
DECLARE @ReportDate DATE = '{ReportDate}';
DECLARE @StartDate  DATE = '2026-04-01';
DECLARE @LastDate   DATE = '2027-03-31';

SET DATEFIRST 7; -- Sunday

WITH LatestData AS
(
    SELECT
        DT,
        CAST(DT AS DATE) AS ReportDate,
        TARGET,
        ACTUAL,
        ROW_NUMBER() OVER
        (
            PARTITION BY
                CAST(DT AS DATE)
            ORDER BY DT DESC
        ) AS RN
    FROM dbo.{DbName}
),
FinalData AS
(
    SELECT
        LD.DT,
        LD.ReportDate,
        LD.TARGET,
        LD.ACTUAL
    FROM LatestData LD
    WHERE LD.RN = 1
),
MonthData AS
(
    SELECT
        ReportDate,
        TARGET,
        ACTUAL,
        (
            (
                DAY(ReportDate)
                + DATEPART
                (
                    WEEKDAY,
                    DATEFROMPARTS
                    (
                        YEAR(ReportDate),
                        MONTH(ReportDate),
                        1
                    )
                )
                - 2
            ) / 7
        ) + 1 AS WeekNo
    FROM FinalData
    WHERE YEAR(ReportDate) = YEAR(@ReportDate)
      AND MONTH(ReportDate) = MONTH(@ReportDate)
)

SELECT
    CONVERT
    (
        VARCHAR(23),
        (
            SELECT MAX(DT)
            FROM FinalData
            WHERE ReportDate = @ReportDate
        ),
        121
    ) AS DT,

    ISNULL
    (
        (
            SELECT SUM(TARGET)
            FROM FinalData
            WHERE ReportDate = @ReportDate
        ),
        0
    ) AS DAILY_TARGET,

    ISNULL
    (
        (
            SELECT SUM(ACTUAL)
            FROM FinalData
            WHERE ReportDate = @ReportDate
        ),
        0
    ) AS DAILY_ACTUAL,

    -- Weekly
    SUM(CASE WHEN WeekNo = 1 THEN TARGET ELSE 0 END) AS W1_TARGET,
    SUM(CASE WHEN WeekNo = 1 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W1_ACTUAL,

    SUM(CASE WHEN WeekNo = 2 THEN TARGET ELSE 0 END) AS W2_TARGET,
    SUM(CASE WHEN WeekNo = 2 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W2_ACTUAL,

    SUM(CASE WHEN WeekNo = 3 THEN TARGET ELSE 0 END) AS W3_TARGET,
    SUM(CASE WHEN WeekNo = 3 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W3_ACTUAL,

    SUM(CASE WHEN WeekNo = 4 THEN TARGET ELSE 0 END) AS W4_TARGET,
    SUM(CASE WHEN WeekNo = 4 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W4_ACTUAL,

    SUM(CASE WHEN WeekNo = 5 THEN TARGET ELSE 0 END) AS W5_TARGET,
    SUM(CASE WHEN WeekNo = 5 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W5_ACTUAL,

    SUM(CASE WHEN WeekNo >= 6 THEN TARGET ELSE 0 END) AS W6_TARGET,
    SUM(CASE WHEN WeekNo >= 6 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W6_ACTUAL,

    -- Monthly
    ISNULL
    (
        (
            SELECT TOP 1 TargetQty
            FROM dbo.{DbName}
            WHERE TargetDate IS NOT NULL
              AND YEAR(TargetDate) = YEAR(@ReportDate)
              AND MONTH(TargetDate) = MONTH(@ReportDate)
        ),
        0
    ) AS MONTHLY_TARGET,
    SUM(CASE WHEN ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS MONTHLY_ACTUAL,

    -- Previous Financial Year
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEADD(YEAR,-1,@StartDate)
              AND
              DATEADD(YEAR,-1,@LastDate)
    ) AS TARGET_PREVIOUS_FINANCIAL_YEAR,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEADD(YEAR,-1,@StartDate)
              AND
              DATEADD(YEAR,-1,@LastDate)
    ) AS ACTUAL_PREVIOUS_FINANCIAL_YEAR,

    -- MTD (Month To Date)
    ISNULL
    (
        (
            SELECT TOP 1 TargetQty
            FROM dbo.{DbName}
            WHERE TargetDate IS NOT NULL
              AND YEAR(TargetDate) = YEAR(@ReportDate)
              AND MONTH(TargetDate) = MONTH(@ReportDate)
        ),
        0
    ) AS MTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_ACTUAL,
     (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_ACTUAL,

    -- Auto Detect Month Days (28/29/30/31)
    DAY(EOMONTH(@ReportDate)) AS DAYS_IN_MONTH,

    -- W6 (Yearly Week 6)
    SUM(CASE WHEN WeekNo >= 6 THEN TARGET ELSE 0 END) AS W6_TARGET,
    SUM(CASE WHEN WeekNo >= 6 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W6_ACTUAL
FROM MonthData;
"""
    cursor.execute(query)
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    print(f"\n--- {DbName} ({ReportDate}) ---")
    for col, val in zip(columns, row):
        print(f"{col}: {val}")

run_query("S_TCF", "2026-05-15")
run_query("S_BIW", "2026-06-12")

conn.close()
