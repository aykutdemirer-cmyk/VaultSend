@echo off
echo Admin parolasi sifirlaniyor...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\reset-admin-password.ps1"
echo.
pause
