@echo off
REM Resume Desktop App Launcher
REM This batch file launches the resume Python GUI application
REM It checks for dependencies and installs them if needed

echo.
echo ====================================
echo Dan Finn - Resume Application
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo Python detected!
echo.

REM Check if required packages are installed
echo Checking dependencies...
python -c "import customtkinter" >nul 2>&1
if errorlevel 1 (
    echo Installing customtkinter...
    pip install customtkinter
    if errorlevel 1 (
        echo ERROR: Failed to install customtkinter
        pause
        exit /b 1
    )
)

python -c "import reportlab" >nul 2>&1
if errorlevel 1 (
    echo Installing reportlab...
    pip install reportlab
    if errorlevel 1 (
        echo ERROR: Failed to install reportlab
        pause
        exit /b 1
    )
)

echo All dependencies installed!
echo.
echo Launching Resume Application...
echo.

REM Launch the Python application
python resume.py

REM If the app crashes or exits, show error
if errorlevel 1 (
    echo.
    echo ERROR: Application exited with an error
    pause
)
