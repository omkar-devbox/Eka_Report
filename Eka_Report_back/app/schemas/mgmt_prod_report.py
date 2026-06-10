from pydantic import BaseModel, Field

class MgmtProdReportRequest(BaseModel):
    ReportDate: str = Field(..., description="Report Date in YYYY-MM-DD format", examples=["2026-04-26"])
    StartDate: str = Field(..., description="Start of Financial Year in YYYY-MM-DD format", examples=["2026-04-01"])
    LastDate: str = Field(..., description="End of Financial Year in YYYY-MM-DD format", examples=["2027-05-31"])
    Shift: str = Field("All", description="Shift value, e.g. 'A', 'B' or 'All'", examples=["All"])

class OpenFileRequest(BaseModel):
    filepath: str = Field(..., description="Absolute path of the file to open/locate")

