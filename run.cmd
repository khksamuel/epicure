@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1" %*
if errorlevel 1 (
  echo.
  echo Kitchen Compass stopped with an error. Check the logs in %%TEMP%%\epicure-platform.
  pause
)

