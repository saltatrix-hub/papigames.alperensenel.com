@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

rem Cursor Agent and Codex desktop keep their CLIs in user-local folders that may
rem not be visible to a process started by double-click until the next sign-in.
if exist "%LOCALAPPDATA%\cursor-agent\agent.cmd" set "PATH=%LOCALAPPDATA%\cursor-agent;%PATH%"
where codex >nul 2>nul
if errorlevel 1 (
  for /d %%D in ("%LOCALAPPDATA%\OpenAI\Codex\bin\*") do (
    if exist "%%~fD\codex.exe" set "PATH=%%~fD;!PATH!"
  )
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

where agent >nul 2>nul
if errorlevel 1 (
  echo Cursor Agent CLI bulunamadi. Once Cursor CLI kur.
  pause
  exit /b 1
)

where codex >nul 2>nul
if errorlevel 1 (
  echo Codex CLI bulunamadi. Codex masaustu uygulamasini acip tekrar dene.
  pause
  exit /b 1
)

%PY% orchestrator.py
echo.
echo [ASTRAYA] Calisma sona erdi. logs ve repo icindeki ai/NIGHTLY_REPORT.md dosyasini kontrol et.
pause
