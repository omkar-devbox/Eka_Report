import sys
import os
import mimetypes
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.api.endpoints import health
from app.api.endpoints import auth
from app.api.endpoints import users
from app.api.MgmtProdReport import mgmt_prod_report
from app.api.ProdReportType2 import prod_report_type2
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes

# Explicitly register JavaScript and CSS MIME types to prevent Windows Registry overrides
mimetypes.add_type("application/javascript", ".js", True)
mimetypes.add_type("text/css", ".css", True)

app = FastAPI(
    title=settings.APP_NAME,
    description="FastAPI base project with Microsoft SQL Server connection using SQLAlchemy & pyodbc.",
    version="1.0.0",
)

# Set up CORS middleware
# Note: In production, specify allowed origins rather than "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(mgmt_prod_report.router, prefix="/api", tags=["Reports"])
app.include_router(prod_report_type2.router, prefix="/api", tags=["Reports"])


def get_frontend_dist_path():
    if getattr(sys, "frozen", False):
        return os.path.join(sys._MEIPASS, "dist")
    else:
        return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Eka_Report_front", "dist"))


frontend_dist = get_frontend_dist_path()

if os.path.exists(frontend_dist):
    # Mount Vite's static assets folder
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve other static files in the root folder, or default to index.html
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Prevent intercepting API, health, docs, and schema endpoints
        if (
            catchall.startswith("api/")
            or catchall == "health"
            or catchall.startswith("docs")
            or catchall.startswith("redoc")
            or catchall == "openapi.json"
        ):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")

        file_path = os.path.join(frontend_dist, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        # If the requested path has a file extension or starts with assets/, it is a missing
        # static file rather than a frontend route. Return 404 instead of serving index.html,
        # which prevents browsers from failing with "strict MIME type checking" errors.
        _, ext = os.path.splitext(catchall)
        if ext or catchall.startswith("assets/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")

        return FileResponse(os.path.join(frontend_dist, "index.html"))

else:
    # If frontend is not built/found, serve standard root endpoint for API
    @app.get("/")
    def read_root():
        """
        Root endpoint serving basic API metadata.
        """
        return {
            "app_name": settings.APP_NAME,
            "environment": settings.APP_ENV,
            "docs_url": "/docs",
            "health_check_url": "/health",
        }

