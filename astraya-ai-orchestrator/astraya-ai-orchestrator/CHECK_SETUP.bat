@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

if exist "%LOCALAPPDATA%\cursor-agent\agent.cmd" set "PATH=%LOCALAPPDATA%\cursor-agent;%PATH%"
where codex >nul 2>nul
if errorlevel 1 (
  for /d %%D in ("%LOCALAPPDATA%\OpenAI\Codex\bin\*") do (
    if exist "%%~fD\codex.exe" set "PATH=%%~fD;!PATH!"
  )
)

echo === Python ===
py --version 2>nul
if errorlevel 1 python --version 2>nul

echo.
echo === Git ===
git --version

echo.
echo === Cursor CLI ===
call agent --version
call agent status

echo.
echo === Codex CLI ===
codex --version
codex login status

echo.
echo === Repo ===
for /f "tokens=1,* delims==" %%A in (config.env) do (
  if "%%A"=="REPO_PATH" set REPO=%%B
)
if "%REPO%"=="" set REPO=..
git -C "%REPO%" status --short --branch

pause
