def S_TCF(ReportDate, StartDate, LastDate) -> str:
    return f"""
DECLARE @ReportDate DATE = '{ReportDate}';
DECLARE @StartDate  DATE = '{StartDate}';
DECLARE @LastDate   DATE = '{LastDate}';

SET DATEFIRST 7; -- Sunday

WITH LatestData AS
(
    SELECT
        DT,
        CAST(DT AS DATE) AS ReportDate,
        Shift,
        TARGET,
        ACTUAL,
        ROW_NUMBER() OVER
        (
            PARTITION BY
                CAST(DT AS DATE),
                ISNULL(CAST(Shift AS VARCHAR(50)), 'NO_SHIFT')
            ORDER BY DT DESC
        ) AS RN
    FROM dbo.S_TCF
),
FinalData AS
(
    SELECT
        LD.DT,
        LD.ReportDate,
        LD.Shift,
        LD.TARGET,
        LD.ACTUAL
    FROM LatestData LD
    WHERE LD.RN = 1
      AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.S_TCF T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )
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
    SUM(CASE WHEN WeekNo = 1 THEN ACTUAL ELSE 0 END) AS W1_ACTUAL,

    SUM(CASE WHEN WeekNo = 2 THEN TARGET ELSE 0 END) AS W2_TARGET,
    SUM(CASE WHEN WeekNo = 2 THEN ACTUAL ELSE 0 END) AS W2_ACTUAL,

    SUM(CASE WHEN WeekNo = 3 THEN TARGET ELSE 0 END) AS W3_TARGET,
    SUM(CASE WHEN WeekNo = 3 THEN ACTUAL ELSE 0 END) AS W3_ACTUAL,

    SUM(CASE WHEN WeekNo = 4 THEN TARGET ELSE 0 END) AS W4_TARGET,
    SUM(CASE WHEN WeekNo = 4 THEN ACTUAL ELSE 0 END) AS W4_ACTUAL,

    SUM(CASE WHEN WeekNo >= 5 THEN TARGET ELSE 0 END) AS W5_TARGET,
    SUM(CASE WHEN WeekNo >= 5 THEN ACTUAL ELSE 0 END) AS W5_ACTUAL,

    -- Monthly
    SUM(TARGET) AS MONTHLY_TARGET,
    SUM(ACTUAL) AS MONTHLY_ACTUAL,

    -- Financial Year Total
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS TARGET_FINANCIAL_YEAR,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS ACTUAL_FINANCIAL_YEAR,

    -- MTD (Month To Date)
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_ACTUAL,

    -- YTD (FY Start To Report Date)
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_ACTUAL

FROM MonthData;
"""

def M_TCF(ReportDate, StartDate, LastDate) -> str:
    return f"""
DECLARE @ReportDate DATE = '{ReportDate}';
DECLARE @StartDate  DATE = '{StartDate}';
DECLARE @LastDate   DATE = '{LastDate}';

SET DATEFIRST 7; -- Sunday

WITH LatestData AS
(
    SELECT
        DT,
        CAST(DT AS DATE) AS ReportDate,
        Shift,
        TARGET,
        ACTUAL,
        ROW_NUMBER() OVER
        (
            PARTITION BY
                CAST(DT AS DATE),
                ISNULL(CAST(Shift AS VARCHAR(50)), 'NO_SHIFT')
            ORDER BY DT DESC
        ) AS RN
    FROM dbo.M_TCF
),
FinalData AS
(
    SELECT
        LD.DT,
        LD.ReportDate,
        LD.Shift,
        LD.TARGET,
        LD.ACTUAL
    FROM LatestData LD
    WHERE LD.RN = 1
      AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.M_TCF T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )
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
    SUM(CASE WHEN WeekNo = 1 THEN ACTUAL ELSE 0 END) AS W1_ACTUAL,

    SUM(CASE WHEN WeekNo = 2 THEN TARGET ELSE 0 END) AS W2_TARGET,
    SUM(CASE WHEN WeekNo = 2 THEN ACTUAL ELSE 0 END) AS W2_ACTUAL,

    SUM(CASE WHEN WeekNo = 3 THEN TARGET ELSE 0 END) AS W3_TARGET,
    SUM(CASE WHEN WeekNo = 3 THEN ACTUAL ELSE 0 END) AS W3_ACTUAL,

    SUM(CASE WHEN WeekNo = 4 THEN TARGET ELSE 0 END) AS W4_TARGET,
    SUM(CASE WHEN WeekNo = 4 THEN ACTUAL ELSE 0 END) AS W4_ACTUAL,

    SUM(CASE WHEN WeekNo >= 5 THEN TARGET ELSE 0 END) AS W5_TARGET,
    SUM(CASE WHEN WeekNo >= 5 THEN ACTUAL ELSE 0 END) AS W5_ACTUAL,

    -- Monthly
    SUM(TARGET) AS MONTHLY_TARGET,
    SUM(ACTUAL) AS MONTHLY_ACTUAL,

    -- Financial Year Total
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS TARGET_FINANCIAL_YEAR,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS ACTUAL_FINANCIAL_YEAR,

    -- MTD (Month To Date)
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_ACTUAL,

    -- YTD (FY Start To Report Date)
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_ACTUAL

FROM MonthData;
"""

def S_BIW(ReportDate, StartDate, LastDate) -> str:
    return f"""
DECLARE @ReportDate DATE = '{ReportDate}';
DECLARE @StartDate  DATE = '{StartDate}';
DECLARE @LastDate   DATE = '{LastDate}';

SET DATEFIRST 7; -- Sunday

WITH LatestData AS
(
    SELECT
        DT,
        CAST(DT AS DATE) AS ReportDate,
        Shift,
        TARGET,
        ACTUAL,
        ROW_NUMBER() OVER
        (
            PARTITION BY
                CAST(DT AS DATE),
                ISNULL(CAST(Shift AS VARCHAR(50)), 'NO_SHIFT')
            ORDER BY DT DESC
        ) AS RN
    FROM dbo.S_BIW
),
FinalData AS
(
    SELECT
        LD.DT,
        LD.ReportDate,
        LD.Shift,
        LD.TARGET,
        LD.ACTUAL
    FROM LatestData LD
    WHERE LD.RN = 1
      AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.S_BIW T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )
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
    SUM(CASE WHEN WeekNo = 1 THEN ACTUAL ELSE 0 END) AS W1_ACTUAL,

    SUM(CASE WHEN WeekNo = 2 THEN TARGET ELSE 0 END) AS W2_TARGET,
    SUM(CASE WHEN WeekNo = 2 THEN ACTUAL ELSE 0 END) AS W2_ACTUAL,

    SUM(CASE WHEN WeekNo = 3 THEN TARGET ELSE 0 END) AS W3_TARGET,
    SUM(CASE WHEN WeekNo = 3 THEN ACTUAL ELSE 0 END) AS W3_ACTUAL,

    SUM(CASE WHEN WeekNo = 4 THEN TARGET ELSE 0 END) AS W4_TARGET,
    SUM(CASE WHEN WeekNo = 4 THEN ACTUAL ELSE 0 END) AS W4_ACTUAL,

    SUM(CASE WHEN WeekNo >= 5 THEN TARGET ELSE 0 END) AS W5_TARGET,
    SUM(CASE WHEN WeekNo >= 5 THEN ACTUAL ELSE 0 END) AS W5_ACTUAL,

    -- Monthly
    SUM(TARGET) AS MONTHLY_TARGET,
    SUM(ACTUAL) AS MONTHLY_ACTUAL,

    -- Financial Year Total
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS TARGET_FINANCIAL_YEAR,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS ACTUAL_FINANCIAL_YEAR,

    -- MTD (Month To Date)
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_ACTUAL,

    -- YTD (FY Start To Report Date)
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_ACTUAL

FROM MonthData;
"""

def M_BIW(ReportDate, StartDate, LastDate) -> str:
    return f"""
DECLARE @ReportDate DATE = '{ReportDate}';
DECLARE @StartDate  DATE = '{StartDate}';
DECLARE @LastDate   DATE = '{LastDate}';

SET DATEFIRST 7; -- Sunday

WITH LatestData AS
(
    SELECT
        DT,
        CAST(DT AS DATE) AS ReportDate,
        Shift,
        TARGET,
        ACTUAL,
        ROW_NUMBER() OVER
        (
            PARTITION BY
                CAST(DT AS DATE),
                ISNULL(CAST(Shift AS VARCHAR(50)), 'NO_SHIFT')
            ORDER BY DT DESC
        ) AS RN
    FROM dbo.M_BIW
),
FinalData AS
(
    SELECT
        LD.DT,
        LD.ReportDate,
        LD.Shift,
        LD.TARGET,
        LD.ACTUAL
    FROM LatestData LD
    WHERE LD.RN = 1
      AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.M_BIW T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )
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
    SUM(CASE WHEN WeekNo = 1 THEN ACTUAL ELSE 0 END) AS W1_ACTUAL,

    SUM(CASE WHEN WeekNo = 2 THEN TARGET ELSE 0 END) AS W2_TARGET,
    SUM(CASE WHEN WeekNo = 2 THEN ACTUAL ELSE 0 END) AS W2_ACTUAL,

    SUM(CASE WHEN WeekNo = 3 THEN TARGET ELSE 0 END) AS W3_TARGET,
    SUM(CASE WHEN WeekNo = 3 THEN ACTUAL ELSE 0 END) AS W3_ACTUAL,

    SUM(CASE WHEN WeekNo = 4 THEN TARGET ELSE 0 END) AS W4_TARGET,
    SUM(CASE WHEN WeekNo = 4 THEN ACTUAL ELSE 0 END) AS W4_ACTUAL,

    SUM(CASE WHEN WeekNo >= 5 THEN TARGET ELSE 0 END) AS W5_TARGET,
    SUM(CASE WHEN WeekNo >= 5 THEN ACTUAL ELSE 0 END) AS W5_ACTUAL,

    -- Monthly
    SUM(TARGET) AS MONTHLY_TARGET,
    SUM(ACTUAL) AS MONTHLY_ACTUAL,

    -- Financial Year Total
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS TARGET_FINANCIAL_YEAR,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS ACTUAL_FINANCIAL_YEAR,

    -- MTD (Month To Date)
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEFROMPARTS(YEAR(@ReportDate),MONTH(@ReportDate),1)
              AND @ReportDate
    ) AS MTD_ACTUAL,

    -- YTD (FY Start To Report Date)
    (
        SELECT ISNULL(SUM(TARGET),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL),0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @ReportDate
    ) AS YTD_ACTUAL

FROM MonthData;
"""


