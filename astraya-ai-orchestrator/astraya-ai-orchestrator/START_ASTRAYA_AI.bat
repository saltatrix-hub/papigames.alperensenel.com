@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

rem Use absolute CLI paths. PATH lookup is unreliable in a window opened by double-click.
set "CURSOR_AGENT_COMMAND=%LOCALAPPDATA%\cursor-agent\agent.cmd"
set "CODEX_COMMAND="
for /d %%D in ("%LOCALAPPDATA%\OpenAI\Codex\bin\*") do (
  if exist "%%~fD\codex.exe" set "CODEX_COMMAND=%%~fD\codex.exe"
)

if not exist "config.env" (
  echo [ASTRAYA] config.env bulunamadi.
  copy /Y "config.env.example" "config.env" >nul
  echo [ASTRAYA] config.env olusturuldu.
  echo OPENAI_API_KEY ve CURSOR_API_KEY alanlarini doldurup tekrar calistir.
  notepad "config.env"
  pause
  exit /b 1
)

where py >nul 2>nul
if %errorlevel%==0 (
  set PY=py
) else (
  where python >nul 2>nul
  if not %errorlevel%==0 (
    echo Python bulunamadi. Python 3.11+ kur.
    pause
    exit /b 1
  )
  set PY=python
)

%PY% -m pip install -r requirements.txt
if not %errorlevel%==0 (
  echo Paket kurulumu basarisiz.
  pause
  exit /b 1
)

if not exist "%CURSOR_AGENT_COMMAND%" (
  echo Cursor Agent CLI bulunamadi. Once Cursor CLI kur.
  pause
  exit /b 1
)

if not defined CODEX_COMMAND (
  echo Codex CLI bulunamadi. Codex masaustu uygulamasini acip tekrar dene.
  pause
  exit /b 1
)

if "%ASTRAYA_PREFLIGHT_ONLY%"=="1" (
  echo ASTRAYA preflight PASS.
  echo Cursor: %CURSOR_AGENT_COMMAND%
  echo Codex: %CODEX_COMMAND%
  exit /b 0
)

%PY% orchestrator.py
echo.
echo [ASTRAYA] Calisma sona erdi. logs ve repo icindeki ai/NIGHTLY_REPORT.md dosyasini kontrol et.
pause
