# build_exe.ps1
# PowerShell script to automate building the Eka Report Studio Windows Executable

$ErrorActionPreference = "Stop"

# Define paths
$WorkspaceRoot = $PSScriptRoot
$FrontendDir = Join-Path $WorkspaceRoot "Eka_Report_front"
$BackendDir = Join-Path $WorkspaceRoot "Eka_Report_back"
$FrontendDist = Join-Path $FrontendDir "dist"
$BackendVenv = Join-Path $BackendDir "venv"
$PythonExe = Join-Path $BackendVenv "Scripts\python.exe"
$PyInstallerExe = Join-Path $BackendVenv "Scripts\pyinstaller.exe"

# ==========================================
# 🛑 AUTO-CLOSE RUNNING PROCESSES (File Locks & Port Collisions)
# ==========================================
Write-Host "`nChecking for running instances of EkaReportStudio.exe..." -ForegroundColor Cyan

# 1. Kill EkaReportStudio.exe and EkaReportStudioSetup.exe processes to release file locks
$RunningProcesses = Get-Process -Name "EkaReportStudio", "EkaReportStudioSetup" -ErrorAction SilentlyContinue
if ($RunningProcesses) {
    Write-Host "⚠️ Found running instances of EkaReportStudio or EkaReportStudioSetup. Terminating processes to release file locks..." -ForegroundColor Yellow
    Stop-Process -Name "EkaReportStudio", "EkaReportStudioSetup" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1.5
    Write-Host "✅ Processes terminated." -ForegroundColor Gray
} else {
    Write-Host "✅ No running processes of EkaReportStudio.exe or EkaReportStudioSetup.exe found." -ForegroundColor Gray
}

# Clean up old setup file if exists
$OldSetup = Join-Path $BackendDir "dist\EkaReportStudioSetup.exe"
if (Test-Path $OldSetup) {
    Remove-Item -Path $OldSetup -Force -ErrorAction SilentlyContinue
}

# 2. Free up Port 8000 if blocked by active python/uvicorn servers
$Port8000Processes = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($Port8000Processes) {
    Write-Host "⚠️ Port 8000 is occupied. Inspecting owning processes..." -ForegroundColor Yellow
    foreach ($PortPID in $Port8000Processes) {
        $Proc = Get-Process -Id $PortPID -ErrorAction SilentlyContinue
        if ($Proc -and ($Proc.Name -eq "python" -or $Proc.Name -eq "EkaReportStudio")) {
            Write-Host "Terminating process PID $PortPID ($($Proc.Name)) running on port 8000..." -ForegroundColor Yellow
            Stop-Process -Id $PortPID -Force
            Start-Sleep -Seconds 1
        }
    }
    Write-Host "✅ Port 8000 freed." -ForegroundColor Gray
}

# ==========================================
# ⚙️ VERIFY & AUTO-INSTALL PREREQUISITES
# ==========================================
Write-Host "`nVerifying development toolchain..." -ForegroundColor Cyan

# 1. Frontend: Check node_modules
if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Host "⚠️ Frontend 'node_modules' folder is missing! Running 'npm install' automatically..." -ForegroundColor Yellow
    Set-Location $FrontendDir
    npm install
} else {
    Write-Host "✅ Frontend dependencies present." -ForegroundColor Gray
}

# 2. Backend: Check virtual environment & PyInstaller
if (-not (Test-Path $BackendVenv)) {
    Write-Host "⚠️ Python virtual environment ('venv') is missing! Creating it now..." -ForegroundColor Yellow
    Set-Location $BackendDir
    python -m venv venv
    Write-Host "Installing backend requirements..." -ForegroundColor Gray
    & $PythonExe -m pip install -r (Join-Path $BackendDir "requirements.txt")
    & $PythonExe -m pip install openpyxl pyinstaller
} elseif (-not (Test-Path $PyInstallerExe)) {
    Write-Host "⚠️ PyInstaller is missing from the virtual environment! Installing now..." -ForegroundColor Yellow
    & $PythonExe -m pip install pyinstaller openpyxl
} else {
    Write-Host "✅ Backend virtual environment and PyInstaller present." -ForegroundColor Gray
}

# ==========================================
# 🛠️ BUILD PROCESS
# ==========================================
try {
    # Step 1: Build Frontend
    Write-Host "`nStep 1: Building React frontend..." -ForegroundColor Green
    Set-Location $FrontendDir
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "React frontend build (npm run build) failed."
    }

# Step 2: Verify Frontend Dist exists
Write-Host "`nStep 2: Verifying frontend build output..." -ForegroundColor Green
if (-not (Test-Path $FrontendDist)) {
    Write-Error "Frontend build directory not found at $FrontendDist!"
}
Write-Host "Frontend build output verified successfully." -ForegroundColor Gray

# Step 3: Package backend and frontend into EXE
Write-Host "`nStep 3: Compiling executable using PyInstaller..." -ForegroundColor Green
Set-Location $BackendDir

# Run PyInstaller with uvicorn and webview hidden imports and static files
# Note: In Windows, the --add-data separator is a semicolon (;)
Write-Host "DEBUG: PyInstaller path is '$PyInstallerExe'" -ForegroundColor Yellow
Write-Host "DEBUG: Test-Path result is: $(Test-Path $PyInstallerExe)" -ForegroundColor Yellow
$IconPath = Join-Path $BackendDir "eka_logo.ico"
& $PythonExe -m PyInstaller --noconfirm --onedir --noconsole `
    --name "EkaReportStudio" `
    --icon "$IconPath" `
    --add-data "$FrontendDist;dist" `
    --add-data "app;app" `
    --add-data ".env;." `
    --add-data "ProductionReport_R3.xlsx;." `
    --add-data "MProductionReport.xlsx;." `
    --hidden-import "uvicorn.protocols.http.h11_impl" `
    --hidden-import "uvicorn.protocols.http.httptools_impl" `
    --hidden-import "uvicorn.protocols.websockets.websockets_impl" `
    --hidden-import "uvicorn.lifespan.on" `
    --hidden-import "uvicorn.lifespan.off" `
    --hidden-import "uvicorn.loops.auto" `
    --hidden-import "uvicorn.loops.asyncio" `
    --hidden-import "sqlite3" `
    --hidden-import "webview" `
    --hidden-import "clr" `
    --hidden-import "jose" `
    --hidden-import "passlib.handlers.bcrypt" `
    --hidden-import "PIL" `
    --hidden-import "PIL.Image" `
    "run.py"

if ($LASTEXITCODE -ne 0) {

    throw "PyInstaller executable compilation failed."
}

# Step 4: Copy env file template to the output dist folder
Write-Host "`nStep 4: Preparing output directory..." -ForegroundColor Green
$DistFolder = Join-Path $BackendDir "dist"
$TargetEnvFile = Join-Path $DistFolder "EkaReportStudio\.env"

if (Test-Path (Join-Path $BackendDir ".env")) {
    Copy-Item -Path (Join-Path $BackendDir ".env") -Destination $TargetEnvFile -Force
    Write-Host "Copied .env configuration file next to executable at $TargetEnvFile" -ForegroundColor Gray
}
else {
    Copy-Item -Path (Join-Path $BackendDir ".env.example") -Destination $TargetEnvFile -Force
    Write-Host "Copied .env.example configuration file template next to executable at $TargetEnvFile" -ForegroundColor Gray
}


# Step 5: Compile Setup Wizard using Inno Setup
Write-Host "`nStep 5: Compiling Setup Wizard using Inno Setup..." -ForegroundColor Green
$InnoPaths = @(
    "$env:LocalAppData\Programs\Inno Setup 6\ISCC.exe",
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe",
    "C:\Program Files (x86)\Inno Setup\ISCC.exe",
    "C:\Program Files\Inno Setup\ISCC.exe"
)

$ISCC = $null
foreach ($path in $InnoPaths) {
    if (Test-Path $path) {
        $ISCC = $path
        break
    }
}

if ($null -eq $ISCC) {
    $ISCC = Get-Command iscc.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
}

if ($null -eq $ISCC) {
    Write-Warning "Inno Setup Compiler (ISCC.exe) not found. Skipping Setup Wizard generation."
    Write-Warning "Please install Inno Setup or make sure it is on your PATH."
}
else {
    Write-Host "Found Inno Setup Compiler at: $ISCC" -ForegroundColor Gray
    $SetupScript = Join-Path $BackendDir "setup.iss"
    & $ISCC $SetupScript
    if ($LASTEXITCODE -ne 0) {
        throw "Inno Setup installer compilation failed."
    }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  BUILD COMPLETE SUCCESSFUL!              " -ForegroundColor Cyan
Write-Host "  Standalone Directory App:               " -ForegroundColor Cyan
Write-Host "  $($DistFolder)\EkaReportStudio\EkaReportStudio.exe" -ForegroundColor Yellow
if ($null -ne $ISCC) {
    Write-Host "  Setup Installer Wizard:                 " -ForegroundColor Cyan
    Write-Host "  $($DistFolder)\EkaReportStudioSetup.exe" -ForegroundColor Yellow
}
Write-Host "==========================================" -ForegroundColor Cyan

}
catch {
    Write-Host "`n==========================================" -ForegroundColor Red
    Write-Host "            ❌ BUILD FAILED!               " -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "Error Details: $_" -ForegroundColor Red
    Write-Host "`n💡 Actionable Fix Guide:" -ForegroundColor Cyan
    Write-Host "1. File Lock: Make sure EkaReportStudio.exe is closed. (We attempted to close it, but if a process is frozen by Windows, manual task killing is required)."
    Write-Host "2. Missing Tools: Ensure Python 3.10+ and Node.js are installed and available on your PATH."
    Write-Host "3. DB Connection: Check Eka_Report_back/.env is set up correctly."
    Write-Host "4. PyInstaller issues: Try deleting the backend 'build' and 'dist' folders and rebuild."
    exit 1
}