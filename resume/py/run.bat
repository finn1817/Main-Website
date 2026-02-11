@echo off
REM Resume Desktop App Launcher
REM This batch file launches the resume Python GUI application
REM It checks for dependencies and installs them if needed

setlocal

REM Ensure we run from this script's directory (keeps paths + PDF output consistent)
pushd "%~dp0"

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
    python -m pip install customtkinter
    if errorlevel 1 (
        echo ERROR: Failed to install customtkinter
        pause
        popd
        exit /b 1
    )
)

python -c "import reportlab" >nul 2>&1
if errorlevel 1 (
    echo Installing reportlab...
    python -m pip install reportlab
    if errorlevel 1 (
        echo ERROR: Failed to install reportlab
        pause
        popd
        exit /b 1
    )
)

REM Pillow is used to render logos/images (optional in code, but install it so it works off the bat)
python -c "from PIL import Image" >nul 2>&1
if errorlevel 1 (
    echo Installing pillow...
    python -m pip install pillow
    if errorlevel 1 (
        echo WARNING: Failed to install pillow (logos may not display)
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

popd
endlocal
