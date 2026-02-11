@echo off
setlocal enabledelayedexpansion

:: Network Analyzer Smart Launcher
:: - Auto-installs dependencies (one-time)
:: - Always runs with admin privileges
:: - Validates environment before launch

title Network Analyzer - Smart Launcher
color 0A

:: Lock to script directory
pushd "%~dp0"

echo.
echo ========================================
echo   Network Analyzer v1.0 Launcher
echo ========================================
echo.

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

:: Check if local venv exists, create if missing
if not exist ".venv\Scripts\python.exe" (
    echo [INFO] Local virtual environment not found
    echo [CREATE] Creating .venv in project folder...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created
)

:: Use local venv Python
set PYTHON_EXE=%~dp0.venv\Scripts\python.exe

:: Smart dependency check - Test for key packages
echo [1/3] Checking dependencies...
"%PYTHON_EXE%" -c "import customtkinter, scapy, psutil, matplotlib, pysnmp" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Dependencies not installed or incomplete
    echo [INSTALL] Running first-time setup...
    echo.
    
    :: Run installer
    "%PYTHON_EXE%" install.py
    if errorlevel 1 (
        echo.
        echo [ERROR] Installation failed
        pause
        exit /b 1
    )
    
    echo.
    echo [SUCCESS] All dependencies installed!
    echo.
) else (
    echo [OK] All dependencies found
)

:: Check if we're already admin
net session >nul 2>&1
if errorlevel 1 (
    echo.
    echo [2/3] Requesting Administrator privileges...
    echo [UAC] Windows will prompt for elevation
    echo.
    
    :: Use PowerShell to elevate and run the Python script with visible terminal
    powershell -Command "Start-Process cmd -ArgumentList '/k cd /d %~dp0 && \"%PYTHON_EXE%\" network_diagnostic_tool.py && echo. && echo [FINISHED] Press any key to close... && pause >nul' -Verb RunAs"
    
    if errorlevel 1 (
        echo [ERROR] Admin elevation was denied or failed
        pause
        exit /b 1
    )
    
    echo [SUCCESS] Network Analyzer launched with admin rights
    echo.
    echo Check the elevated window for output.
    echo You can close this window.
    timeout /t 3 >nul
    exit /b 0
) else (
    echo [2/3] Already running as Administrator
    echo.
    echo [3/3] Launching Network Analyzer...
    echo.
    
    :: We're already admin, just run it
    "%PYTHON_EXE%" network_diagnostic_tool.py
    
    if errorlevel 1 (
        echo.
        echo [ERROR] Application crashed or exited with error code: %errorlevel%
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo [FINISHED] Application closed normally
    pause
)

popd
