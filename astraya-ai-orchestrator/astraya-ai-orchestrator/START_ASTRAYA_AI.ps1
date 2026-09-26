$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$cursorCommand = Join-Path $env:LOCALAPPDATA 'cursor-agent\agent.cmd'
$codexCommand = Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin') `
    -Directory -ErrorAction SilentlyContinue |
    ForEach-Object { Join-Path $_.FullName 'codex.exe' } |
    Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
    Select-Object -Last 1

if (-not (Test-Path -LiteralPath $cursorCommand -PathType Leaf)) {
    Write-Host "Cursor Agent CLI bulunamadi: $cursorCommand" -ForegroundColor Red
    Write-Host 'Cursor CLI kurulumunu tekrar calistir veya agent.cmd yolunu kontrol et.'
    exit 1
}

if (-not $codexCommand) {
    Write-Host 'Codex CLI bulunamadi. Codex masaustu uygulamasini acip tekrar dene.' -ForegroundColor Red
    exit 1
}

$pythonCommand = Get-Command py -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
}
if (-not $pythonCommand) {
    Write-Host 'Python bulunamadi. Python 3.11+ kur.' -ForegroundColor Red
    exit 1
}

$env:CURSOR_AGENT_COMMAND = $cursorCommand
$env:CODEX_COMMAND = $codexCommand
$env:PIP_DISABLE_PIP_VERSION_CHECK = '1'

if (-not (Test-Path -LiteralPath 'config.env' -PathType Leaf)) {
    Copy-Item -LiteralPath 'config.env.example' -Destination 'config.env'
    Write-Host '[ASTRAYA] config.env olusturuldu. Gerekli ayarlari doldurup tekrar calistir.'
    Start-Process notepad.exe -ArgumentList (Join-Path $PSScriptRoot 'config.env')
    exit 1
}

& $pythonCommand.Source -m pip install --disable-pip-version-check -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    throw 'Python paket kurulumu basarisiz.'
}

if ($env:ASTRAYA_PREFLIGHT_ONLY -eq '1') {
    Write-Host 'ASTRAYA preflight PASS.' -ForegroundColor Green
    Write-Host "Cursor: $cursorCommand"
    Write-Host "Codex: $codexCommand"
    exit 0
}

& $pythonCommand.Source orchestrator.py
exit $LASTEXITCODE

