@echo off
setlocal enabledelayedexpansion
title Indian Income Tax & ITR-U Calculator - Standalone Desktop Launcher
color 0B

echo ===============================================================================
echo   INDIAN INCOME TAX, 234A/B/C, 220(2), 115BAC & ITR-U PROFESSIONAL CALCULATOR
echo ===============================================================================
echo.
echo [1/3] Initializing runtime and checking environment...

:: 1. If precompiled standalone IndianTaxCalculator.exe exists, launch it directly
if exist "%~dp0IndianTaxCalculator.exe" (
    echo [INFO] Found bundled standalone executable: IndianTaxCalculator.exe
    echo [2/3] Launching standalone IndianTaxCalculator.exe...
    start "" "%~dp0IndianTaxCalculator.exe"
    goto :started
)

:: 2. If node is installed on system PATH
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] System Node.js detected.
    echo [2/3] Launching application server...
    start "" node "%~dp0runner.cjs"
    goto :started
)

:: 3. Check for portable node in .runtime folder
if exist "%~dp0.runtime\node.exe" (
    echo [INFO] Found local portable Node.js runtime.
    echo [2/3] Launching application server with local runtime...
    start "" "%~dp0.runtime\node.exe" "%~dp0runner.cjs"
    goto :started
)

:: 4. If neither node nor exe exists, download portable zero-install Node.js automatically
echo [NOTICE] Standalone Node.js runtime not found on this machine.
echo [SETUP]  Downloading lightweight portable Node.js runtime (~30MB, one-time setup)...
echo          No installation or admin permissions required.
echo.

if not exist "%~dp0.runtime" mkdir "%~dp0.runtime"

powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Write-Host 'Downloading portable runtime...'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.12.2/win-x64/node.exe' -OutFile '%~dp0.runtime\node.exe'"

if exist "%~dp0.runtime\node.exe" (
    echo [SUCCESS] Portable runtime configured successfully!
    echo [2/3] Launching application server...
    start "" "%~dp0.runtime\node.exe" "%~dp0runner.cjs"
    goto :started
) else (
    echo [ERROR] Could not download portable runtime automatically.
    echo Please install Node.js from https://nodejs.org or run IndianTaxCalculator.exe.
    pause
    exit /b 1
)

:started
echo [3/3] Application is launching!
echo.
echo ===============================================================================
echo   APPLICATION RUNNING AT: http://localhost:3000
echo ===============================================================================
echo   * Your default web browser will open automatically in a few seconds.
echo   * If it does not open, simply paste http://localhost:3000 into your browser.
echo   * All tax engines, statutory rules (AY 2017-18 to 2031-32), Sec 87A, 115BAC,
echo     ITR-U, 234A/B/C/220(2) interest calculators, and PDF/Excel generators
echo     are fully operational offline without any internet connection.
echo ===============================================================================
echo.
echo Keep this window open while using the program. To close the program, close this window.
echo.
pause
