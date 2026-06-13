"""
SQL Query functions for the Chassis Loss Report.
All queries are parameterised by StartTime and EndTime (YYYY-MM-DD HH:MM:SS).
Only data whose DT falls within [StartTime, EndTime] is included.

Tables used: dbo.CH_S1 through dbo.CH_S6
Expected CH_Sx schema columns:
    DT          DATETIME        - timestamp of the call record
    Typeofcall  INT             - 1=Process, 2=Material, 3=Quality, 4=Maintenance, else=Other
    LossTime    NUMERIC/INT     - duration of the call in SECONDS
    Reason      VARCHAR/INT     - reason code or short text
    Remark      VARCHAR         - free-text remark
"""


def ChassisLossReportSummary(start_time: str, end_time: str) -> str:
    """
    Aggregates call frequency and total loss time (seconds) per station and call type
    for all records with DT between start_time and end_time (inclusive).

    Station mapping:
        CH_S1 -> Station 10  (CH-10)
        CH_S2 -> Station 20  (CH-20)
        CH_S3 -> Station 30  (CH-30)
        CH_S4 -> Station 40  (CH-40)
        CH_S5 -> Station 50  (CH-50)
        CH_S6 -> Station 60  (CH-60)

    Result columns per row (one row per station):
        StationLabel    VARCHAR   e.g. 'CH-10'
        TotalMin        FLOAT     grand total LossTime (seconds) for this station
        TotalFreq       INT       total record count for this station
        ProcessMin      FLOAT     SUM(LossTime) WHERE Typeofcall=1
        ProcessFreq     INT       COUNT(*)       WHERE Typeofcall=1
        MaterialMin     FLOAT     SUM(LossTime) WHERE Typeofcall=2
        MaterialFreq    INT       COUNT(*)       WHERE Typeofcall=2
        QualityMin      FLOAT     SUM(LossTime) WHERE Typeofcall=3
        QualityFreq     INT       COUNT(*)       WHERE Typeofcall=3
        MaintMin        FLOAT     SUM(LossTime) WHERE Typeofcall=4
        MaintFreq       INT       COUNT(*)       WHERE Typeofcall=4
        OtherMin        FLOAT     SUM(LossTime) WHERE Typeofcall NOT IN (1,2,3,4)
        OtherFreq       INT       COUNT(*)       WHERE Typeofcall NOT IN (1,2,3,4)
    """
    return f"""
DECLARE @StartTime DATETIME = '{start_time}';
DECLARE @EndTime   DATETIME = '{end_time}';

WITH AllStations AS
(
    SELECT 'CH-10' AS StationLabel, Typeofcall, LossTime FROM dbo.CH_S1
    WHERE DT BETWEEN @StartTime AND @EndTime

    UNION ALL
    SELECT 'CH-20', Typeofcall, LossTime FROM dbo.CH_S2
    WHERE DT BETWEEN @StartTime AND @EndTime

    UNION ALL
    SELECT 'CH-30', Typeofcall, LossTime FROM dbo.CH_S3
    WHERE DT BETWEEN @StartTime AND @EndTime

    UNION ALL
    SELECT 'CH-40', Typeofcall, LossTime FROM dbo.CH_S4
    WHERE DT BETWEEN @StartTime AND @EndTime

    UNION ALL
    SELECT 'CH-50', Typeofcall, LossTime FROM dbo.CH_S5
    WHERE DT BETWEEN @StartTime AND @EndTime

    UNION ALL
    SELECT 'CH-60', Typeofcall, LossTime FROM dbo.CH_S6
    WHERE DT BETWEEN @StartTime AND @EndTime
),

StationList AS
(
    SELECT 'CH-10' AS StationLabel, 1 AS SortOrder
    UNION ALL SELECT 'CH-20', 2
    UNION ALL SELECT 'CH-30', 3
    UNION ALL SELECT 'CH-40', 4
    UNION ALL SELECT 'CH-50', 5
    UNION ALL SELECT 'CH-60', 6
)

SELECT
    SL.StationLabel,

    -- Grand total for the station
    ISNULL(SUM(ISNULL(A.LossTime, 0)), 0) AS TotalMin,
    COUNT(A.StationLabel)                  AS TotalFreq,

    -- Process Call (Typeofcall = 1)
    ISNULL(SUM(CASE WHEN A.Typeofcall = 1 THEN ISNULL(A.LossTime, 0) ELSE 0 END), 0) AS ProcessMin,
    SUM(CASE WHEN A.Typeofcall = 1 THEN 1 ELSE 0 END)                                 AS ProcessFreq,

    -- Material Call (Typeofcall = 2)
    ISNULL(SUM(CASE WHEN A.Typeofcall = 2 THEN ISNULL(A.LossTime, 0) ELSE 0 END), 0) AS MaterialMin,
    SUM(CASE WHEN A.Typeofcall = 2 THEN 1 ELSE 0 END)                                 AS MaterialFreq,

    -- Quality Call (Typeofcall = 3)
    ISNULL(SUM(CASE WHEN A.Typeofcall = 3 THEN ISNULL(A.LossTime, 0) ELSE 0 END), 0) AS QualityMin,
    SUM(CASE WHEN A.Typeofcall = 3 THEN 1 ELSE 0 END)                                 AS QualityFreq,

    -- Maintenance Call (Typeofcall = 4)
    ISNULL(SUM(CASE WHEN A.Typeofcall = 4 THEN ISNULL(A.LossTime, 0) ELSE 0 END), 0) AS MaintMin,
    SUM(CASE WHEN A.Typeofcall = 4 THEN 1 ELSE 0 END)                                 AS MaintFreq,

    -- Other Call (Typeofcall NOT IN 1,2,3,4 or NULL)
    ISNULL(SUM(CASE WHEN A.Typeofcall NOT IN (1,2,3,4) OR A.Typeofcall IS NULL
                    THEN ISNULL(A.LossTime, 0) ELSE 0 END), 0)                        AS OtherMin,
    SUM(CASE WHEN A.Typeofcall NOT IN (1,2,3,4) OR A.Typeofcall IS NULL
             THEN 1 ELSE 0 END)                                                        AS OtherFreq

FROM StationList SL
LEFT JOIN AllStations A ON SL.StationLabel = A.StationLabel
GROUP BY SL.StationLabel, SL.SortOrder
ORDER BY SL.SortOrder;
"""


def ChassisLossReportHistory(start_time: str, end_time: str) -> str:
    """
    Returns all raw call records from CH_S1 through CH_S6 within [start_time, end_time],
    ordered by DT ascending.

    Result columns:
        DT              DATETIME    - call start timestamp
        StationLabel    VARCHAR     - e.g. 'CH-10'
        StationNo       INT         - numeric station number (10, 20, … 60)
        Typeofcall      INT         - raw call type code
        CallTypeText    VARCHAR     - 'Process Call' / 'Material Call' / etc.
        LossTime        NUMERIC     - duration in SECONDS
        CallEndTime     DATETIME    - computed as DT + LossTime seconds
        Reason          VARCHAR     - reason code / short text
        Remark          VARCHAR     - free-text remark
    """
    return f"""
DECLARE @StartTime DATETIME = '{start_time}';
DECLARE @EndTime   DATETIME = '{end_time}';

SELECT
    DT,
    'CH-10'  AS StationLabel,
    10       AS StationNo,
    Typeofcall,
    CASE
        WHEN Typeofcall = 1 THEN 'Process Call'
        WHEN Typeofcall = 2 THEN 'Material Call'
        WHEN Typeofcall = 3 THEN 'Quality Call'
        WHEN Typeofcall = 4 THEN 'Maintenance Call'
        ELSE 'Other'
    END AS CallTypeText,
    ISNULL(LossTime, 0) AS LossTime,
    DATEADD(SECOND, ISNULL(LossTime, 0), DT) AS CallEndTime,
    CAST(Reason AS VARCHAR(MAX)) AS Reason,
    Remark
FROM dbo.CH_S1
WHERE DT BETWEEN @StartTime AND @EndTime

UNION ALL

SELECT
    DT, 'CH-20', 20, Typeofcall,
    CASE
        WHEN Typeofcall = 1 THEN 'Process Call'
        WHEN Typeofcall = 2 THEN 'Material Call'
        WHEN Typeofcall = 3 THEN 'Quality Call'
        WHEN Typeofcall = 4 THEN 'Maintenance Call'
        ELSE 'Other'
    END,
    ISNULL(LossTime, 0),
    DATEADD(SECOND, ISNULL(LossTime, 0), DT),
    CAST(Reason AS VARCHAR(MAX)),
    Remark
FROM dbo.CH_S2
WHERE DT BETWEEN @StartTime AND @EndTime

UNION ALL

SELECT
    DT, 'CH-30', 30, Typeofcall,
    CASE
        WHEN Typeofcall = 1 THEN 'Process Call'
        WHEN Typeofcall = 2 THEN 'Material Call'
        WHEN Typeofcall = 3 THEN 'Quality Call'
        WHEN Typeofcall = 4 THEN 'Maintenance Call'
        ELSE 'Other'
    END,
    ISNULL(LossTime, 0),
    DATEADD(SECOND, ISNULL(LossTime, 0), DT),
    CAST(Reason AS VARCHAR(MAX)),
    Remark
FROM dbo.CH_S3
WHERE DT BETWEEN @StartTime AND @EndTime

UNION ALL

SELECT
    DT, 'CH-40', 40, Typeofcall,
    CASE
        WHEN Typeofcall = 1 THEN 'Process Call'
        WHEN Typeofcall = 2 THEN 'Material Call'
        WHEN Typeofcall = 3 THEN 'Quality Call'
        WHEN Typeofcall = 4 THEN 'Maintenance Call'
        ELSE 'Other'
    END,
    ISNULL(LossTime, 0),
    DATEADD(SECOND, ISNULL(LossTime, 0), DT),
    CAST(Reason AS VARCHAR(MAX)),
    Remark
FROM dbo.CH_S4
WHERE DT BETWEEN @StartTime AND @EndTime

UNION ALL

SELECT
    DT, 'CH-50', 50, Typeofcall,
    CASE
        WHEN Typeofcall = 1 THEN 'Process Call'
        WHEN Typeofcall = 2 THEN 'Material Call'
        WHEN Typeofcall = 3 THEN 'Quality Call'
        WHEN Typeofcall = 4 THEN 'Maintenance Call'
        ELSE 'Other'
    END,
    ISNULL(LossTime, 0),
    DATEADD(SECOND, ISNULL(LossTime, 0), DT),
    CAST(Reason AS VARCHAR(MAX)),
    Remark
FROM dbo.CH_S5
WHERE DT BETWEEN @StartTime AND @EndTime

UNION ALL

SELECT
    DT, 'CH-60', 60, Typeofcall,
    CASE
        WHEN Typeofcall = 1 THEN 'Process Call'
        WHEN Typeofcall = 2 THEN 'Material Call'
        WHEN Typeofcall = 3 THEN 'Quality Call'
        WHEN Typeofcall = 4 THEN 'Maintenance Call'
        ELSE 'Other'
    END,
    ISNULL(LossTime, 0),
    DATEADD(SECOND, ISNULL(LossTime, 0), DT),
    CAST(Reason AS VARCHAR(MAX)),
    Remark
FROM dbo.CH_S6
WHERE DT BETWEEN @StartTime AND @EndTime

ORDER BY DT ASC;
"""
