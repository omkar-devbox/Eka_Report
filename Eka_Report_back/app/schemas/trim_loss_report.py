from pydantic import BaseModel, Field


class TrimLossReportRequest(BaseModel):
    StartTime: str = Field(
        ...,
        description="Report start datetime in 'YYYY-MM-DD HH:MM:SS' format",
        examples=["2026-06-13 06:00:00"],
    )
    EndTime: str = Field(
        ...,
        description="Report end datetime in 'YYYY-MM-DD HH:MM:SS' format",
        examples=["2026-06-13 18:00:00"],
    )


class OpenTrimFileRequest(BaseModel):
    filepath: str = Field(..., description="Absolute path of the file to open/locate")
