@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_ASTRAYA_AI.ps1"
echo.
echo [ASTRAYA] Calisma sona erdi. logs ve repo icindeki ai\NIGHTLY_REPORT.md dosyasini kontrol et.
pause

