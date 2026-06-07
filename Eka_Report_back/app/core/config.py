import sys
from pathlib import Path

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

if getattr(sys, "frozen", False):
    # Running in PyInstaller bundle
    # meipass_dir contains default packed config files
    meipass_dir = Path(sys._MEIPASS)
    # exe_dir contains local config files right next to the executable
    exe_dir = Path(sys.executable).resolve().parent
    env_files = (meipass_dir / ".env", exe_dir / ".env")
    BASE_DIR = exe_dir
else:
    # Dev mode
    BASE_DIR = Path(__file__).resolve().parents[2]
    env_files = (BASE_DIR / ".env",)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_files,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    APP_NAME: str = "EKA Report API"
    APP_ENV: str = "dev"

    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # SQL Server
    DB_SERVER: str = "localhost"
    DB_DATABASE: str = ""
    DB_USERNAME: str | None = None
    DB_PASSWORD: str | None = None

    DB_PORT: int | None = None
    DB_DRIVER: str = "ODBC Driver 17 for SQL Server"
    DB_ENCRYPT: str = "no"
    DB_TRUST_SERVER_CERTIFICATE: str = "no"
    DB_TRUSTED_CONNECTION: str = "no"

    @computed_field
    @property
    def connection_string(self) -> str:
        server = f"{self.DB_SERVER},{self.DB_PORT}" if self.DB_PORT else self.DB_SERVER
        conn_str = (
            f"DRIVER={{{self.DB_DRIVER}}};"
            f"SERVER={server};"
            f"DATABASE={self.DB_DATABASE};"
        )
        if self.DB_TRUSTED_CONNECTION and self.DB_TRUSTED_CONNECTION.lower() in ("yes", "true", "1"):
            conn_str += "Trusted_Connection=yes;"
        else:
            if self.DB_USERNAME:
                conn_str += f"UID={self.DB_USERNAME};"
            if self.DB_PASSWORD:
                conn_str += f"PWD={self.DB_PASSWORD};"
        conn_str += f"Encrypt={self.DB_ENCRYPT};TrustServerCertificate={self.DB_TRUST_SERVER_CERTIFICATE};"
        return conn_str

    @computed_field
    @property
    def ODBC_CONNECTION_STRING(self) -> str:
        return self.connection_string


settings = Settings()