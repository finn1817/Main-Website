@echo off
setlocal

REM Tools Dashboard Launcher
REM This section launches the Tkinter GUI for project tools

cd /d "%~dp0"

REM Prefer virtual environment Python if present
if exist "..\.venv\Scripts\python.exe" (
  echo Starting Tools Dashboard with venv Python...
  "..\.venv\Scripts\python.exe" "tools_dashboard.py"
  goto :EOF
)

REM Try Python launcher (py)
where py >nul 2>&1
if %ERRORLEVEL%==0 (
  echo Starting Tools Dashboard with py launcher...
  py -3 "tools_dashboard.py"
  goto :EOF
)

REM Fallback to system Python
echo Starting Tools Dashboard with system Python...
python "tools_dashboard.py"

endlocal
