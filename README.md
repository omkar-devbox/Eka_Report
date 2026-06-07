# Eka Report Studio - Setup & Execution Guide

Eka Report Studio is a dual-component desktop-centric web application with a FastAPI + Microsoft SQL Server backend and a React (Vite + Tailwind CSS v4) frontend. It compiles into a standalone, single-executable Windows app (`.exe`) with an embedded web UI using PyInstaller.

---

## 📋 Prerequisites

Before starting, ensure your system has the following installed:
1. **Python 3.10+** (Make sure to check the box "Add Python to PATH" during installation)
2. **Node.js 18+** (Includes `npm`)
3. **ODBC Driver for SQL Server**: Required by `pyodbc` to connect to Microsoft SQL Server. If not present, download the driver from Microsoft's website.
4. **PowerShell**: To execute the Windows build script.

---

## 🛠️ Environment Configuration

Both the frontend and backend require configured environment files.

### 1. Backend Config (`Eka_Report_back/.env`)
Create a file named `.env` in the `Eka_Report_back` folder based on `.env.example`:
```env
APP_NAME="Eka Report Studio"
APP_ENV="development"
HOST="127.0.0.1"
PORT=8000

# SQL Server Database Configuration
DB_SERVER="YOUR_SERVER_NAME"
DB_DATABASE="YOUR_DATABASE_NAME"
DB_USERNAME="YOUR_USERNAME"
DB_PASSWORD="YOUR_PASSWORD"
```

### 2. Frontend Config (`Eka_Report_front/.env`)
Create a file named `.env` in the `Eka_Report_front` folder:
```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## 🚀 Execution Instructions

You can run the application in two ways: **Development Mode** (running frontend and backend servers separately) or **Standalone Executable Mode** (packaging everything into a single `.exe`).

### Option A: Development Mode (Recommended for Code Edits)

#### 1. Start Backend FastAPI Server
1. Open terminal and navigate to the backend folder:
   ```powershell
   cd d:\Eka_Report_exe\Eka_Report_back
   ```
2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # On Windows CMD:
   .\venv\Scripts\activate.bat
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   pip install openpyxl  # (Ensures Excel read/write package is present)
   ```
4. Run the uvicorn development server:
   ```powershell
   python run.py
   ```
   *The server will start running at `http://127.0.0.1:8000` with hot-reloading active.*

#### 2. Start Frontend Vite Server
1. Open a new terminal and navigate to the frontend folder:
   ```powershell
   cd d:\Eka_Report_exe\Eka_Report_front
   ```
2. Install Node packages:
   ```powershell
   npm install
   ```
3. Run the development server:
   ```powershell
   npm run dev
   ```
   *The client interface will spin up (usually at `http://localhost:5173`). Open this URL in your browser.*

---

### Option B: Standalone Executable Mode (Production Packaging)

To automate compiling the client assets, injecting static assets into PyInstaller, and creating a final double-clickable executable:

1. Open PowerShell and navigate to the project root:
   ```powershell
   cd d:\Eka_Report_exe
   ```
2. Run the automated PowerShell script:
   ```powershell
   .\build_exe.ps1
   ```
   *This script compiles the React frontend assets, embeds them, packages the Python backend via PyInstaller, and (if installed) triggers Inno Setup to create an installer.*

3. **Running the Output App**:
   - Navigate to `d:\Eka_Report_exe\Eka_Report_back\dist\`.
   - Run the compiled binary: `EkaReportStudio.exe`.
   - It will boot up the local server and **automatically open your web browser** pointing directly to your Eka Dashboard!

---

## 🔍 Trouble Shooting & Tips

- **pyodbc Connection Issues**: Double check that your `DB_SERVER`, `DB_DATABASE`, and credentials inside `Eka_Report_back/.env` are correct. Verify that TCP/IP is enabled in SQL Server Configuration Manager under SQL Server Network Configuration.
- **Excel Ingestion/Download Errors**: If the report fails to download from the dashboard, ensure the original template file `EKA Production Report_R2.xlsx` exists in the root directory.



Run these commands:

powershell -ExecutionPolicy Bypass -File .\build_exe.ps1
