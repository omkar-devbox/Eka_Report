<<<<<<< Updated upstream
def SaarthiMickyReportTCFBIW(ReportDate, StartDate, LastDate, Shift="All",DbName="") -> str:
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
   -- Weekly
SUM(CASE WHEN WeekNo = 1 THEN TARGET ELSE 0 END) AS W1_TARGET,
SUM(CASE WHEN WeekNo = 1 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W1_ACTUAL,

SUM(CASE WHEN WeekNo = 2 THEN TARGET ELSE 0 END) AS W2_TARGET,
SUM(CASE WHEN WeekNo = 2 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W2_ACTUAL,

SUM(CASE WHEN WeekNo = 3 THEN TARGET ELSE 0 END) AS W3_TARGET,
SUM(CASE WHEN WeekNo = 3 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W3_ACTUAL,

SUM(CASE WHEN WeekNo = 4 THEN TARGET ELSE 0 END) AS W4_TARGET,
SUM(CASE WHEN WeekNo = 4 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W4_ACTUAL,

SUM(CASE WHEN WeekNo >= 5 THEN TARGET ELSE 0 END) AS W5_TARGET,
SUM(CASE WHEN WeekNo >= 5 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W5_ACTUAL,

    -- Monthly
    SUM(TARGET) AS MONTHLY_TARGET,
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
    DAY(EOMONTH(@ReportDate)) AS DAYS_IN_MONTH
FROM MonthData;
"""


def SaarthiMickyReportTCFBIW1(ReportDate, StartDate, LastDate, Shift="All",DbName="") -> str:
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

    SUM(CASE WHEN WeekNo >= 5 THEN TARGET ELSE 0 END) AS W5_TARGET,
    SUM(CASE WHEN WeekNo >= 5 AND ReportDate <= @ReportDate THEN ACTUAL ELSE 0 END) AS W5_ACTUAL,

    -- Monthly
    SUM(TARGET) AS MONTHLY_TARGET,
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
    DAY(EOMONTH(@ReportDate)) AS DAYS_IN_MONTH
FROM MonthData;
"""


def SaarthiMickyWeekwiseMonthly(ReportDate, Shift="All", DbName="") -> str:
    """
    Fetches production data aggregated by ISO calendar week for a given month of ReportDate.
    Result columns: ISOWeek, WK_TARGET, WK_ACTUAL.
    """
    shift_filter = ""
    if Shift != "All":
        shift_filter = f"AND LTRIM(RTRIM(LD.Shift)) = '{Shift}'"
    else:
        shift_filter = f"""AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.{DbName} T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )"""

    return f"""
DECLARE @ReportDate DATE = '{ReportDate}';

SET DATEFIRST 1; -- Monday (ISO 8601 week start)

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
    FROM dbo.{DbName}
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
      {shift_filter}
)
SELECT
    DATEPART(ISO_WEEK, ReportDate)  AS ISOWeek,
    ISNULL(SUM(TARGET), 0)         AS WK_TARGET,
    ISNULL(SUM(ACTUAL), 0)         AS WK_ACTUAL
FROM FinalData
WHERE YEAR(ReportDate)  = YEAR(@ReportDate)
  AND MONTH(ReportDate) = MONTH(@ReportDate)
GROUP BY DATEPART(ISO_WEEK, ReportDate)
ORDER BY ISOWeek;
"""


def LineStopRecordDaily(ReportDate) -> str:
    return f"""
WITH CH AS
(
    SELECT 31 AS StationNo, DT, Reason, Remark, LossTime FROM dbo.CH_S1
    UNION ALL SELECT 32, DT, Reason, Remark, LossTime FROM dbo.CH_S2
    UNION ALL SELECT 33, DT, Reason, Remark, LossTime FROM dbo.CH_S3
    UNION ALL SELECT 34, DT, Reason, Remark, LossTime FROM dbo.CH_S4
    UNION ALL SELECT 35, DT, Reason, Remark, LossTime FROM dbo.CH_S5
    UNION ALL SELECT 36, DT, Reason, Remark, LossTime FROM dbo.CH_S6
),

BaseData AS
(
    SELECT
        ls.DT,
        ls.StationNo,
        ls.LineStopTime,

        CASE
            WHEN ls.TypeOfCall = 1 THEN 'Process Call'
            WHEN ls.TypeOfCall = 2 THEN 'Material Call'
            WHEN ls.TypeOfCall = 3 THEN 'Quality Call'
            WHEN ls.TypeOfCall = 4 THEN 'Maintenance Call'
            ELSE 'Other'
        END AS TypeOfCallText,

        CASE
            WHEN ls.TypeOfCall = 1 THEN pc.Reason
            WHEN ls.TypeOfCall = 2 THEN sc.Reason
            WHEN ls.TypeOfCall = 3 THEN qc.Reason
            WHEN ls.TypeOfCall = 4 THEN mc.Reason
        END AS LineLossReason,

        CHRemark.Remark AS StationRemark,

        CASE
            WHEN ls.StationNo BETWEEN 31 AND 36 THEN 'Chassis'
            WHEN ls.StationNo BETWEEN 25 AND 30 THEN 'Trim'
            WHEN ls.StationNo BETWEEN 18 AND 24 THEN 'Saarthi Main'
            WHEN ls.StationNo BETWEEN 14 AND 17 THEN 'Saarthi Sub'
            WHEN ls.StationNo BETWEEN 5  AND 13 THEN 'I-PUMA Main'
            WHEN ls.StationNo BETWEEN 1  AND 4  THEN 'I-PUMA Sub'
            WHEN ls.StationNo BETWEEN 37 AND 42 THEN 'Cargo Main'
            WHEN ls.StationNo BETWEEN 43 AND 46 THEN 'Cargo Sub'
        END AS StationGroup

    FROM dbo.LineStopRecord ls

    LEFT JOIN dbo.Process_Call pc
        ON ls.Reason = pc.Sr_No
       AND ls.TypeOfCall = 1

    LEFT JOIN dbo.Store_Call sc
        ON ls.Reason = sc.Sr_No
       AND ls.TypeOfCall = 2

    LEFT JOIN dbo.Quality_Call qc
        ON ls.Reason = qc.Sr_No
       AND ls.TypeOfCall = 3

    LEFT JOIN dbo.Maintenance_Call mc
        ON ls.Reason = mc.Sr_No
       AND ls.TypeOfCall = 4

    OUTER APPLY
    (
        SELECT TOP 1
            LTRIM(RTRIM(ch.Remark)) AS Remark
        FROM CH ch
        WHERE ch.StationNo = ls.StationNo
          AND CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
          AND ch.Remark IS NOT NULL
          AND LTRIM(RTRIM(ch.Remark)) NOT IN ('', '0', 'null')
        ORDER BY ABS(DATEDIFF(SECOND, ch.DT, ls.DT))
    ) CHRemark

    WHERE CAST(ls.DT AS DATE) = '{ReportDate}'
),

AggData AS
(
    SELECT
        TypeOfCallText,
        StationGroup,
        SUM(LineStopTime) AS TotalLossTime,
        COUNT(*) AS LossCount
    FROM BaseData
    GROUP BY
        TypeOfCallText,
        StationGroup
),

MaxReason AS
(
    SELECT
        TypeOfCallText,
        LineLossReason,
        StationRemark,
        ROW_NUMBER() OVER
        (
            PARTITION BY TypeOfCallText
            ORDER BY LineStopTime DESC, DT DESC
        ) AS RN
    FROM BaseData
    WHERE StationGroup = 'Chassis'
)

SELECT
    A.TypeOfCallText,

    SUM(CASE WHEN A.StationGroup='Chassis'
             THEN A.TotalLossTime ELSE 0 END) AS Chassis,

    SUM(CASE WHEN A.StationGroup='Trim'
             THEN A.TotalLossTime ELSE 0 END) AS Trim,

    SUM(CASE WHEN A.StationGroup='Saarthi Main'
             THEN A.TotalLossTime ELSE 0 END) AS [Saarthi Main],

    SUM(CASE WHEN A.StationGroup='Saarthi Sub'
             THEN A.TotalLossTime ELSE 0 END) AS [Saarthi Sub],

    SUM(CASE WHEN A.StationGroup='I-PUMA Main'
             THEN A.TotalLossTime ELSE 0 END) AS [I-PUMA Main],

    SUM(CASE WHEN A.StationGroup='I-PUMA Sub'
             THEN A.TotalLossTime ELSE 0 END) AS [I-PUMA Sub],

    SUM(CASE WHEN A.StationGroup='Cargo Main'
             THEN A.TotalLossTime ELSE 0 END) AS [Cargo Main],

    SUM(CASE WHEN A.StationGroup='Cargo Sub'
             THEN A.TotalLossTime ELSE 0 END) AS [Cargo Sub],

    MAX(MR.LineLossReason) AS [Chassis Line Loss Reason],
    MAX(MR.StationRemark)  AS [Remark]

FROM AggData A

LEFT JOIN
(
    SELECT
        TypeOfCallText,
        LineLossReason,
        StationRemark
    FROM MaxReason
    WHERE RN = 1
) MR
ON A.TypeOfCallText = MR.TypeOfCallText

GROUP BY
    A.TypeOfCallText

ORDER BY
CASE A.TypeOfCallText
    WHEN 'Process Call' THEN 1
    WHEN 'Material Call' THEN 2
    WHEN 'Quality Call' THEN 3
    WHEN 'Maintenance Call' THEN 4
    ELSE 5
END;
"""

def LineStopRecordMonthly(ReportDate) -> str:
    return f"""
SELECT
    ls.DT,
    ls.LineStopTime,
    ls.TypeOfCall,
    CASE 
        WHEN ls.TypeOfCall = 1 THEN 'Process Call'
        WHEN ls.TypeOfCall = 2 THEN 'Material Call'
        WHEN ls.TypeOfCall = 3 THEN 'Quality Call'
        WHEN ls.TypeOfCall = 4 THEN 'Maintenance Call'
        ELSE 'Other'
    END AS TypeOfCallText,
    ls.Reason AS ReasonCode,
    CASE
        WHEN ls.StationNo = 31 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S1 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S1 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 32 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S2 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S2 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 33 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S3 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S3 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 34 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S4 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S4 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 35 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S5 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S5 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 36 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S6 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S6 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.TypeOfCall = 1 THEN pc.Reason
        WHEN ls.TypeOfCall = 2 THEN sc.Reason
        WHEN ls.TypeOfCall = 3 THEN qc.Reason
        WHEN ls.TypeOfCall = 4 THEN mc.Reason
        ELSE NULL
    END AS ReasonText,
    ls.StationNo
FROM dbo.LineStopRecord ls
LEFT JOIN dbo.Process_Call pc ON ls.Reason = pc.Sr_No AND ls.TypeOfCall = 1
LEFT JOIN dbo.Store_Call sc ON ls.Reason = sc.Sr_No AND ls.TypeOfCall = 2
LEFT JOIN dbo.Quality_Call qc ON ls.Reason = qc.Sr_No AND ls.TypeOfCall = 3
LEFT JOIN dbo.Maintenance_Call mc ON ls.Reason = mc.Sr_No AND ls.TypeOfCall = 4
WHERE YEAR(ls.DT) = YEAR('{ReportDate}') AND MONTH(ls.DT) = MONTH('{ReportDate}')
ORDER BY ls.DT ASC;
"""

def ProductionLossDaily(ReportDate, Shift="All") -> str:
    shift_cond = ""
    if Shift != "All":
        shift_cond = f"AND LTRIM(RTRIM(Shift)) = '{Shift}'"
    return f"""
WITH LatestLoss AS
(
    SELECT
        Shift,
        ShiftStart,
        ShiftEnd,
        ProdCount,
        ProdLoss,
        ShiftTime,
        BreakTime,
        LinePause,
        DownTime,
        ShiftWorkingTime,
        OEE,
        DT,
        ROW_NUMBER() OVER
        (
            PARTITION BY
                LTRIM(RTRIM(Shift))
            ORDER BY DT DESC
        ) AS RN
    FROM dbo.Production_Loss
    WHERE CAST(DT AS DATE) = '{ReportDate}' {shift_cond}
)
SELECT
    Shift,
    ShiftStart,
    ShiftEnd,
    ProdCount,
    ProdLoss,
    ShiftTime,
    BreakTime,
    LinePause,
    DownTime,
    ShiftWorkingTime,
    OEE,
    DT
FROM LatestLoss
WHERE RN = 1
ORDER BY Shift ASC;
"""

def ChassisLineStatus(ReportDate, Shift="All") -> str:
    PL_ShiftFilter = ""
    if Shift != "All":
        PL_ShiftFilter = f"AND Shift = '{Shift}'"

    return f"""
WITH CH_All AS
(
    SELECT 'CH-10' AS StationNumber, Typeofcall, Remark, LossTime, DT FROM dbo.CH_S1
    UNION ALL
    SELECT 'CH-20', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S2
    UNION ALL
    SELECT 'CH-30', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S3
    UNION ALL
    SELECT 'CH-40', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S4
    UNION ALL
    SELECT 'CH-50', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S5
    UNION ALL
    SELECT 'CH-60', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S6
),
BaseData AS
(
    SELECT
        StationNumber,
        Typeofcall,
        LossTime,
        Remark,
        DT
    FROM CH_All
    WHERE CAST(DT AS DATE) = '{ReportDate}'
),
AggData AS
(
    SELECT
        StationNumber,
        ISNULL(SUM(CASE WHEN Typeofcall = 1 THEN LossTime ELSE 0 END), 0) AS ProcessLoss,
        ISNULL(SUM(CASE WHEN Typeofcall = 2 THEN LossTime ELSE 0 END), 0) AS MaterialLoss,
        ISNULL(SUM(CASE WHEN Typeofcall = 3 THEN LossTime ELSE 0 END), 0) AS QualityLoss,
        ISNULL(SUM(CASE WHEN Typeofcall = 4 THEN LossTime ELSE 0 END), 0) AS MaintLoss,
        ISNULL(SUM(CASE WHEN Typeofcall NOT IN (1,2,3,4) OR Typeofcall IS NULL THEN LossTime ELSE 0 END), 0) AS OtherLoss,
        ISNULL(SUM(LossTime), 0) AS TotalLoss,
        COUNT(*) AS RecordCount
    FROM BaseData
    GROUP BY StationNumber
),
MaxRemark AS
(
    SELECT
        StationNumber,
        Remark,
        ROW_NUMBER() OVER (PARTITION BY StationNumber ORDER BY LossTime DESC, DT DESC) AS RN
    FROM BaseData
    WHERE Remark IS NOT NULL AND LTRIM(RTRIM(Remark)) NOT IN ('', '0', 'null')
),
ProdLoss AS
(
    SELECT TOP 1
        Shift,
        ShiftStart,
        ShiftEnd,
        ProdCount,
        ProdLoss,
        ShiftTime,
        BreakTime,
        LinePause,
        DownTime,
        ShiftWorkingTime,
        OEE
    FROM dbo.Production_Loss
    WHERE CAST(DT AS DATE) = '{ReportDate}'
      {PL_ShiftFilter}
    ORDER BY Shift ASC
)
SELECT
    S.StationNumber,
    ISNULL(A.ProcessLoss, 0) AS ProcessLoss,
    ISNULL(A.MaterialLoss, 0) AS MaterialLoss,
    ISNULL(A.QualityLoss, 0) AS QualityLoss,
    ISNULL(A.MaintLoss, 0) AS MaintLoss,
    ISNULL(A.OtherLoss, 0) AS OtherLoss,
    ISNULL(A.TotalLoss, 0) AS TotalLoss,
    ISNULL(A.RecordCount, 0) AS RecordCount,
    MR.Remark,
    
    -- Production Loss columns
    PL.Shift,
    PL.ShiftStart,
    PL.ShiftEnd,
    PL.ProdCount,
    PL.ProdLoss,
    PL.ShiftTime,
    PL.BreakTime,
    PL.LinePause,
    PL.DownTime,
    PL.ShiftWorkingTime,
    PL.OEE

FROM (
    SELECT 'CH-10' AS StationNumber
    UNION ALL SELECT 'CH-20'
    UNION ALL SELECT 'CH-30'
    UNION ALL SELECT 'CH-40'
    UNION ALL SELECT 'CH-50'
    UNION ALL SELECT 'CH-60'
) S
LEFT JOIN AggData A ON S.StationNumber = A.StationNumber
LEFT JOIN MaxRemark MR ON S.StationNumber = MR.StationNumber AND MR.RN = 1
LEFT JOIN ProdLoss PL ON 1=1
ORDER BY S.StationNumber;
"""

# ALTER TABLE [TRIM_PC].[dbo].[Production_Loss]
# ADD StationNo INT NULL;
=======
def SaarthiMickyReportTCFBIW(ReportDate, StartDate, LastDate, Shift="All",DbName="") -> str:
    shift_filter = ""
    if Shift != "All":
        shift_filter = f"AND LTRIM(RTRIM(LD.Shift)) = '{Shift}'"
    else:
        shift_filter = f"""AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.{DbName} T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )"""

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
    FROM dbo.{DbName}
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
      {shift_filter}
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
   -- Weekly
SUM(CASE WHEN WeekNo = 1 THEN TARGET ELSE 0 END) AS W1_TARGET,
SUM(CASE WHEN WeekNo = 1 THEN ACTUAL ELSE 0 END) AS W1_ACTUAL,

SUM(CASE WHEN WeekNo = 2 THEN TARGET ELSE 0 END) AS W2_TARGET,
SUM(CASE WHEN WeekNo = 2 THEN ACTUAL ELSE 0 END) AS W2_ACTUAL,

SUM(CASE WHEN WeekNo = 3 THEN TARGET ELSE 0 END) AS W3_TARGET,
SUM(CASE WHEN WeekNo = 3 THEN ACTUAL ELSE 0 END) AS W3_ACTUAL,

SUM(CASE WHEN WeekNo = 4 THEN TARGET ELSE 0 END) AS W4_TARGET,
SUM(CASE WHEN WeekNo = 4 THEN ACTUAL ELSE 0 END) AS W4_ACTUAL,

SUM(CASE WHEN WeekNo = 5 THEN TARGET ELSE 0 END) AS W5_TARGET,
SUM(CASE WHEN WeekNo = 5 THEN ACTUAL ELSE 0 END) AS W5_ACTUAL,

CASE
WHEN EXISTS (SELECT 1 FROM MonthData WHERE WeekNo = 6)
THEN SUM(CASE WHEN WeekNo = 6 THEN TARGET ELSE 0 END)
ELSE NULL
END AS W6_TARGET,

CASE
WHEN EXISTS (SELECT 1 FROM MonthData WHERE WeekNo = 6)
THEN SUM(CASE WHEN WeekNo = 6 THEN ACTUAL ELSE 0 END)
ELSE NULL
END AS W6_ACTUAL,

    -- Monthly
    SUM(TARGET) AS MONTHLY_TARGET,
    SUM(ACTUAL) AS MONTHLY_ACTUAL,

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
    DAY(EOMONTH(@ReportDate)) AS DAYS_IN_MONTH
FROM MonthData;
"""


def SaarthiMickyReportTCFBIW1(ReportDate, StartDate, LastDate, Shift="All",DbName="") -> str:
    shift_filter = ""
    if Shift != "All":
        shift_filter = f"AND LTRIM(RTRIM(LD.Shift)) = '{Shift}'"
    else:
        shift_filter = f"""AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.{DbName} T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )"""

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
    FROM dbo.{DbName}
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
      {shift_filter}
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
    DAY(EOMONTH(@ReportDate)) AS DAYS_IN_MONTH
FROM MonthData;
"""


def SaarthiMickyWeekwiseMonthly(ReportDate, Shift="All", DbName="") -> str:
    """
    Returns one row per ISO calendar week that has data in the report month.

    Result columns (3 total):
        [0]  ISOWeek    -- ISO 8601 week number (Monday start, 1-53)
        [1]  WK_TARGET  -- sum of TARGET for that ISO week
        [2]  WK_ACTUAL  -- sum of ACTUAL for that ISO week

    Rows are ordered by ISOWeek ASC.
    """
    shift_filter = ""
    if Shift != "All":
        shift_filter = f"AND LTRIM(RTRIM(LD.Shift)) = '{Shift}'"
    else:
        shift_filter = f"""AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.{DbName} T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )"""

    return f"""
DECLARE @ReportDate DATE = '{ReportDate}';

SET DATEFIRST 1; -- Monday (ISO 8601 week start)

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
    FROM dbo.{DbName}
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
      {shift_filter}
)
SELECT
    DATEPART(ISO_WEEK, ReportDate)  AS ISOWeek,
    ISNULL(SUM(TARGET), 0)         AS WK_TARGET,
    ISNULL(SUM(ACTUAL), 0)         AS WK_ACTUAL
FROM FinalData
WHERE YEAR(ReportDate)  = YEAR(@ReportDate)
  AND MONTH(ReportDate) = MONTH(@ReportDate)
GROUP BY DATEPART(ISO_WEEK, ReportDate)
ORDER BY ISOWeek;
"""


def LineStopRecordDaily(ReportDate) -> str:
    return f"""
WITH CH AS
(
    SELECT 31 AS StationNo, DT, Reason, Remark, LossTime FROM dbo.CH_S1
    UNION ALL SELECT 32, DT, Reason, Remark, LossTime FROM dbo.CH_S2
    UNION ALL SELECT 33, DT, Reason, Remark, LossTime FROM dbo.CH_S3
    UNION ALL SELECT 34, DT, Reason, Remark, LossTime FROM dbo.CH_S4
    UNION ALL SELECT 35, DT, Reason, Remark, LossTime FROM dbo.CH_S5
    UNION ALL SELECT 36, DT, Reason, Remark, LossTime FROM dbo.CH_S6
),

BaseData AS
(
    SELECT
        ls.DT,
        ls.StationNo,
        ls.LineStopTime,

        CASE
            WHEN ls.TypeOfCall = 1 THEN 'Process Call'
            WHEN ls.TypeOfCall = 2 THEN 'Material Call'
            WHEN ls.TypeOfCall = 3 THEN 'Quality Call'
            WHEN ls.TypeOfCall = 4 THEN 'Maintenance Call'
            ELSE 'Other'
        END AS TypeOfCallText,

        CASE
            WHEN ls.TypeOfCall = 1 THEN pc.Reason
            WHEN ls.TypeOfCall = 2 THEN sc.Reason
            WHEN ls.TypeOfCall = 3 THEN qc.Reason
            WHEN ls.TypeOfCall = 4 THEN mc.Reason
        END AS LineLossReason,

        CHRemark.Remark AS StationRemark,

        CASE
            WHEN ls.StationNo BETWEEN 31 AND 36 THEN 'Chassis'
            WHEN ls.StationNo BETWEEN 25 AND 30 THEN 'Trim'
            WHEN ls.StationNo BETWEEN 18 AND 24 THEN 'Saarthi Main'
            WHEN ls.StationNo BETWEEN 14 AND 17 THEN 'Saarthi Sub'
            WHEN ls.StationNo BETWEEN 5  AND 13 THEN 'I-PUMA Main'
            WHEN ls.StationNo BETWEEN 1  AND 4  THEN 'I-PUMA Sub'
            WHEN ls.StationNo BETWEEN 37 AND 42 THEN 'Cargo Main'
            WHEN ls.StationNo BETWEEN 43 AND 46 THEN 'Cargo Sub'
        END AS StationGroup

    FROM dbo.LineStopRecord ls

    LEFT JOIN dbo.Process_Call pc
        ON ls.Reason = pc.Sr_No
       AND ls.TypeOfCall = 1

    LEFT JOIN dbo.Store_Call sc
        ON ls.Reason = sc.Sr_No
       AND ls.TypeOfCall = 2

    LEFT JOIN dbo.Quality_Call qc
        ON ls.Reason = qc.Sr_No
       AND ls.TypeOfCall = 3

    LEFT JOIN dbo.Maintenance_Call mc
        ON ls.Reason = mc.Sr_No
       AND ls.TypeOfCall = 4

    OUTER APPLY
    (
        SELECT TOP 1
            LTRIM(RTRIM(ch.Remark)) AS Remark
        FROM CH ch
        WHERE ch.StationNo = ls.StationNo
          AND CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
          AND ch.Remark IS NOT NULL
          AND LTRIM(RTRIM(ch.Remark)) NOT IN ('', '0', 'null')
        ORDER BY ABS(DATEDIFF(SECOND, ch.DT, ls.DT))
    ) CHRemark

    WHERE CAST(ls.DT AS DATE) = '{ReportDate}'
),

AggData AS
(
    SELECT
        TypeOfCallText,
        StationGroup,
        SUM(LineStopTime) AS TotalLossTime,
        COUNT(*) AS LossCount
    FROM BaseData
    GROUP BY
        TypeOfCallText,
        StationGroup
),

MaxReason AS
(
    SELECT
        TypeOfCallText,
        LineLossReason,
        StationRemark,
        ROW_NUMBER() OVER
        (
            PARTITION BY TypeOfCallText
            ORDER BY LineStopTime DESC, DT DESC
        ) AS RN
    FROM BaseData
    WHERE StationGroup = 'Chassis'
)

SELECT
    A.TypeOfCallText,

    SUM(CASE WHEN A.StationGroup='Chassis'
             THEN A.TotalLossTime ELSE 0 END) AS Chassis,

    SUM(CASE WHEN A.StationGroup='Trim'
             THEN A.TotalLossTime ELSE 0 END) AS Trim,

    SUM(CASE WHEN A.StationGroup='Saarthi Main'
             THEN A.TotalLossTime ELSE 0 END) AS [Saarthi Main],

    SUM(CASE WHEN A.StationGroup='Saarthi Sub'
             THEN A.TotalLossTime ELSE 0 END) AS [Saarthi Sub],

    SUM(CASE WHEN A.StationGroup='I-PUMA Main'
             THEN A.TotalLossTime ELSE 0 END) AS [I-PUMA Main],

    SUM(CASE WHEN A.StationGroup='I-PUMA Sub'
             THEN A.TotalLossTime ELSE 0 END) AS [I-PUMA Sub],

    SUM(CASE WHEN A.StationGroup='Cargo Main'
             THEN A.TotalLossTime ELSE 0 END) AS [Cargo Main],

    SUM(CASE WHEN A.StationGroup='Cargo Sub'
             THEN A.TotalLossTime ELSE 0 END) AS [Cargo Sub],

    MAX(MR.LineLossReason) AS [Chassis Line Loss Reason],
    MAX(MR.StationRemark)  AS [Remark]

FROM AggData A

LEFT JOIN
(
    SELECT
        TypeOfCallText,
        LineLossReason,
        StationRemark
    FROM MaxReason
    WHERE RN = 1
) MR
ON A.TypeOfCallText = MR.TypeOfCallText

GROUP BY
    A.TypeOfCallText

ORDER BY
CASE A.TypeOfCallText
    WHEN 'Process Call' THEN 1
    WHEN 'Material Call' THEN 2
    WHEN 'Quality Call' THEN 3
    WHEN 'Maintenance Call' THEN 4
    ELSE 5
END;
"""

def LineStopRecordMonthly(ReportDate) -> str:
    return f"""
SELECT
    ls.DT,
    ls.LineStopTime,
    ls.TypeOfCall,
    CASE 
        WHEN ls.TypeOfCall = 1 THEN 'Process Call'
        WHEN ls.TypeOfCall = 2 THEN 'Material Call'
        WHEN ls.TypeOfCall = 3 THEN 'Quality Call'
        WHEN ls.TypeOfCall = 4 THEN 'Maintenance Call'
        ELSE 'Other'
    END AS TypeOfCallText,
    ls.Reason AS ReasonCode,
    CASE
        WHEN ls.StationNo = 31 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S1 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S1 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 32 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S2 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S2 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 33 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S3 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S3 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 34 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S4 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S4 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 35 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S5 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S5 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.StationNo = 36 THEN 
            COALESCE(
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S6 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Reason = ls.Reason
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                (
                    SELECT TOP 1 LTRIM(RTRIM(ch.Remark))
                    FROM dbo.CH_S6 ch
                    WHERE CAST(ch.DT AS DATE) = CAST(ls.DT AS DATE)
                      AND ch.Remark IS NOT NULL AND LTRIM(RTRIM(ch.Remark)) NOT IN ('0', 'null', '')
                    ORDER BY ABS(DATEDIFF(second, ch.DT, ls.DT)) ASC
                ),
                pc.Reason, sc.Reason, qc.Reason, mc.Reason
            )
        WHEN ls.TypeOfCall = 1 THEN pc.Reason
        WHEN ls.TypeOfCall = 2 THEN sc.Reason
        WHEN ls.TypeOfCall = 3 THEN qc.Reason
        WHEN ls.TypeOfCall = 4 THEN mc.Reason
        ELSE NULL
    END AS ReasonText,
    ls.StationNo
FROM dbo.LineStopRecord ls
LEFT JOIN dbo.Process_Call pc ON ls.Reason = pc.Sr_No AND ls.TypeOfCall = 1
LEFT JOIN dbo.Store_Call sc ON ls.Reason = sc.Sr_No AND ls.TypeOfCall = 2
LEFT JOIN dbo.Quality_Call qc ON ls.Reason = qc.Sr_No AND ls.TypeOfCall = 3
LEFT JOIN dbo.Maintenance_Call mc ON ls.Reason = mc.Sr_No AND ls.TypeOfCall = 4
WHERE YEAR(ls.DT) = YEAR('{ReportDate}') AND MONTH(ls.DT) = MONTH('{ReportDate}')
ORDER BY ls.DT ASC;
"""

def ProductionLossDaily(ReportDate, Shift="All") -> str:
    shift_cond = ""
    if Shift != "All":
        shift_cond = f"AND LTRIM(RTRIM(Shift)) = '{Shift}'"
    return f"""
SELECT
    Shift,
    ShiftStart,
    ShiftEnd,
    ProdCount,
    ProdLoss,
    ShiftTime,
    BreakTime,
    LinePause,
    DownTime,
    ShiftWorkingTime,
    OEE,
    DT
FROM dbo.Production_Loss
WHERE CAST(DT AS DATE) = '{ReportDate}' {shift_cond}
ORDER BY Shift ASC;
"""

def ChassisLineStatus(ReportDate, Shift="All") -> str:
    PL_ShiftFilter = ""
    if Shift != "All":
        PL_ShiftFilter = f"AND PL.Shift = '{Shift}'"

    return f"""
WITH CH_All AS
(
    SELECT 'CH-10' AS StationNumber, Typeofcall, Remark, LossTime, DT FROM dbo.CH_S1
    UNION ALL
    SELECT 'CH-20', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S2
    UNION ALL
    SELECT 'CH-30', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S3
    UNION ALL
    SELECT 'CH-40', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S4
    UNION ALL
    SELECT 'CH-50', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S5
    UNION ALL
    SELECT 'CH-60', Typeofcall, Remark, LossTime, DT FROM dbo.CH_S6
),
BaseData AS
(
    SELECT
        StationNumber,
        Typeofcall,
        LossTime,
        Remark,
        DT
    FROM CH_All
    WHERE CAST(DT AS DATE) = '{ReportDate}'
),
AggData AS
(
    SELECT
        StationNumber,
        ISNULL(SUM(CASE WHEN Typeofcall = 1 THEN LossTime ELSE 0 END), 0) AS ProcessLoss,
        ISNULL(SUM(CASE WHEN Typeofcall = 2 THEN LossTime ELSE 0 END), 0) AS MaterialLoss,
        ISNULL(SUM(CASE WHEN Typeofcall = 3 THEN LossTime ELSE 0 END), 0) AS QualityLoss,
        ISNULL(SUM(CASE WHEN Typeofcall = 4 THEN LossTime ELSE 0 END), 0) AS MaintLoss,
        ISNULL(SUM(CASE WHEN Typeofcall NOT IN (1,2,3,4) OR Typeofcall IS NULL THEN LossTime ELSE 0 END), 0) AS OtherLoss,
        ISNULL(SUM(LossTime), 0) AS TotalLoss,
        COUNT(*) AS RecordCount
    FROM BaseData
    GROUP BY StationNumber
),
MaxRemark AS
(
    SELECT
        StationNumber,
        Remark,
        ROW_NUMBER() OVER (PARTITION BY StationNumber ORDER BY LossTime DESC, DT DESC) AS RN
    FROM BaseData
    WHERE Remark IS NOT NULL AND LTRIM(RTRIM(Remark)) NOT IN ('', '0', 'null')
),
ProdLoss AS
(
    SELECT
        CASE 
            WHEN StationNo BETWEEN 31 AND 36 THEN StationNo
            WHEN StationNo IN (10, 20, 30, 40, 50, 60) THEN (StationNo / 10) + 30
            ELSE StationNo
        END AS StationNo,
        MAX(Shift) AS Shift,
        MIN(ShiftStart) AS ShiftStart,
        MAX(ShiftEnd) AS ShiftEnd,
        SUM(ProdCount) AS ProdCount,
        SUM(ProdLoss) AS ProdLoss,
        SUM(ShiftTime) AS ShiftTime,
        SUM(BreakTime) AS BreakTime,
        SUM(LinePause) AS LinePause,
        SUM(DownTime) AS DownTime,
        SUM(ShiftWorkingTime) AS ShiftWorkingTime,
        AVG(OEE) AS OEE
    FROM dbo.Production_Loss
    WHERE CAST(DT AS DATE) = '{ReportDate}'
      {PL_ShiftFilter}
    GROUP BY 
        CASE 
            WHEN StationNo BETWEEN 31 AND 36 THEN StationNo
            WHEN StationNo IN (10, 20, 30, 40, 50, 60) THEN (StationNo / 10) + 30
            ELSE StationNo
        END
)
SELECT
    S.StationNumber,
    ISNULL(A.ProcessLoss, 0) AS ProcessLoss,
    ISNULL(A.MaterialLoss, 0) AS MaterialLoss,
    ISNULL(A.QualityLoss, 0) AS QualityLoss,
    ISNULL(A.MaintLoss, 0) AS MaintLoss,
    ISNULL(A.OtherLoss, 0) AS OtherLoss,
    ISNULL(A.TotalLoss, 0) AS TotalLoss,
    ISNULL(A.RecordCount, 0) AS RecordCount,
    MR.Remark,
    
    -- Production Loss columns
    PL.Shift,
    PL.ShiftStart,
    PL.ShiftEnd,
    PL.ProdCount,
    PL.ProdLoss,
    PL.ShiftTime,
    PL.BreakTime,
    PL.LinePause,
    PL.DownTime,
    PL.ShiftWorkingTime,
    PL.OEE

FROM (
    SELECT 'CH-10' AS StationNumber, 31 AS StationNo
    UNION ALL SELECT 'CH-20', 32
    UNION ALL SELECT 'CH-30', 33
    UNION ALL SELECT 'CH-40', 34
    UNION ALL SELECT 'CH-50', 35
    UNION ALL SELECT 'CH-60', 36
) S
LEFT JOIN AggData A ON S.StationNumber = A.StationNumber
LEFT JOIN MaxRemark MR ON S.StationNumber = MR.StationNumber AND MR.RN = 1
LEFT JOIN ProdLoss PL ON PL.StationNo = S.StationNo
ORDER BY S.StationNumber;
"""

# ALTER TABLE [TRIM_PC].[dbo].[Production_Loss]
# ADD StationNo INT NULL;


def SaarthiMickyReportWeekly(ReportYear, StartDate, LastDate, Shift="All", DbName="") -> str:
    """
    Fetches production data aggregated by ISO calendar week (Week 1 – Week 53)
    for a given calendar year.  Structure mirrors the monthly query but the
    grouping dimension is DATEPART(ISO_WEEK, ReportDate) instead of MONTH.

    Parameters
    ----------
    ReportYear : int | str
        The 4-digit calendar year to report on (e.g. 2026).
    StartDate  : str  – financial-year start date  (YYYY-MM-DD)
    LastDate   : str  – financial-year end date    (YYYY-MM-DD)
    Shift      : str  – 'All' or a specific shift name
    DbName     : str  – table name in dbo schema   (e.g. 'S_TCF')
    """
    shift_filter = ""
    if Shift != "All":
        shift_filter = f"AND LTRIM(RTRIM(LD.Shift)) = '{Shift}'"
    else:
        shift_filter = f"""AND
      (
            LD.Shift IS NOT NULL

            OR

            (
                LD.Shift IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM dbo.{DbName} T
                    WHERE CAST(T.DT AS DATE) = LD.ReportDate
                      AND T.Shift IS NOT NULL
                )
            )
      )"""

    # Build W1..W53 pivot columns dynamically
    week_columns = "\n".join(
        f"    SUM(CASE WHEN ISOWeek = {w} THEN TARGET ELSE 0 END) AS W{w}_TARGET,\n"
        f"    SUM(CASE WHEN ISOWeek = {w} THEN ACTUAL ELSE 0 END) AS W{w}_ACTUAL,"
        for w in range(1, 54)
    )

    return f"""
DECLARE @ReportYear  INT  = {ReportYear};
DECLARE @StartDate   DATE = '{StartDate}';
DECLARE @LastDate    DATE = '{LastDate}';

SET DATEFIRST 1; -- Monday (ISO week starts on Monday)

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
    FROM dbo.{DbName}
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
      {shift_filter}
),
YearData AS
(
    SELECT
        ReportDate,
        TARGET,
        ACTUAL,
        -- ISO week number within the calendar year (1-53)
        DATEPART(ISO_WEEK, ReportDate) AS ISOWeek,
        -- Handle the edge case where ISO week 53 of previous year
        -- or ISO week 1 of next year bleeds across Jan/Dec boundary.
        -- We only keep rows whose ISO year matches @ReportYear.
        DATEPART(YEAR,
            -- ISO year: shift date to Thursday of that week; its year = ISO year
            DATEADD(DAY, 3 - (DATEPART(WEEKDAY, ReportDate) + 5) % 7, ReportDate)
        ) AS ISOYear
    FROM FinalData
    WHERE YEAR(ReportDate) = @ReportYear
       -- Include Dec days that may belong to ISO week 1 of next year
       -- and Jan days that may belong to ISO week 52/53 of prev year
       -- by filtering on ISOYear instead; handled below via outer WHERE
),
WeekData AS
(
    SELECT
        ReportDate,
        TARGET,
        ACTUAL,
        ISOWeek
    FROM YearData
    WHERE ISOYear = @ReportYear
)

SELECT
    -- ── Year-level summary ───────────────────────────────────────────────
    @ReportYear AS REPORT_YEAR,

    -- Previous Financial Year totals
    (
        SELECT ISNULL(SUM(TARGET), 0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEADD(YEAR, -1, @StartDate)
              AND
              DATEADD(YEAR, -1, @LastDate)
    ) AS TARGET_PREVIOUS_FINANCIAL_YEAR,

    (
        SELECT ISNULL(SUM(ACTUAL), 0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN
              DATEADD(YEAR, -1, @StartDate)
              AND
              DATEADD(YEAR, -1, @LastDate)
    ) AS ACTUAL_PREVIOUS_FINANCIAL_YEAR,

    -- YTD totals (financial year start → financial year end)
    (
        SELECT ISNULL(SUM(TARGET), 0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS YTD_TARGET,

    (
        SELECT ISNULL(SUM(ACTUAL), 0)
        FROM FinalData FD
        WHERE FD.ReportDate BETWEEN @StartDate AND @LastDate
    ) AS YTD_ACTUAL,

    -- Full-year totals (calendar year)
    SUM(TARGET) AS YEARLY_TARGET,
    SUM(ACTUAL) AS YEARLY_ACTUAL,

    -- Total ISO weeks that have data in this year
    COUNT(DISTINCT ISOWeek) AS WEEKS_WITH_DATA,

    -- ── Per-week columns  W1_TARGET / W1_ACTUAL … W53_TARGET / W53_ACTUAL ─
{week_columns}

FROM WeekData;
"""
>>>>>>> Stashed changes
