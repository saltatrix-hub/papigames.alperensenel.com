@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "CURSOR_AGENT_COMMAND=%LOCALAPPDATA%\cursor-agent\agent.cmd"
set "CODEX_COMMAND="
for /d %%D in ("%LOCALAPPDATA%\OpenAI\Codex\bin\*") do (
  if exist "%%~fD\codex.exe" set "CODEX_COMMAND=%%~fD\codex.exe"
)

echo === Python ===
py --version 2>nul
if errorlevel 1 python --version 2>nul

echo.
echo === Git ===
git --version

echo.
echo === Cursor CLI ===
call "%CURSOR_AGENT_COMMAND%" --version
call "%CURSOR_AGENT_COMMAND%" status

echo.
echo === Codex CLI ===
"%CODEX_COMMAND%" --version
"%CODEX_COMMAND%" login status

echo.
echo === Repo ===
for /f "tokens=1,* delims==" %%A in (config.env) do (
  if "%%A"=="REPO_PATH" set REPO=%%B
)
if "%REPO%"=="" set REPO=..
git -C "%REPO%" status --short --branch

pause
