@echo off
setlocal
title Indian Tax Calculator - Windows EXE Compiler
color 0A

echo ===============================================================================
echo   COMPILING STANDALONE WINDOWS EXECUTABLE (.EXE)
echo ===============================================================================
echo.
echo [1/3] Building frontend production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Compiling standalone IndianTaxCalculator.exe with embedded assets...
call npx --yes pkg@5.8.1 runner.cjs --assets "dist/**/*" --target node18-win-x64 --output IndianTaxCalculator.exe --public
if %errorlevel% neq 0 (
    echo [ERROR] EXE packaging failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Done! Successfully generated standalone executable:
echo       IndianTaxCalculator.exe
echo.
echo You can now double-click IndianTaxCalculator.exe to run the application offline
echo with all prerequisite software, database, and tax utilities included!
echo ===============================================================================
pause
