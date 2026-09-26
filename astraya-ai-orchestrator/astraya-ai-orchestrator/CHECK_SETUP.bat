@echo off
setlocal
cd /d "%~dp0"

echo === Python ===
py --version 2>nul
if errorlevel 1 python --version 2>nul

echo.
echo === Git ===
git --version

echo.
echo === Cursor CLI ===
agent --version
agent status

echo.
echo === Repo ===
for /f "tokens=1,* delims==" %%A in (config.env) do (
  if "%%A"=="REPO_PATH" set REPO=%%B
)
if "%REPO%"=="" set REPO=..
git -C "%REPO%" status --short --branch

pause
