[CmdletBinding()]
param([switch]$Network)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$modelService = Join-Path $projectRoot "services\model-service"
$apiService = Join-Path $projectRoot "services\api"
$frontend = Join-Path $projectRoot "frontend"
$python = Join-Path $modelService ".venv\Scripts\python.exe"
$maven = Join-Path $apiService "mvnw.cmd"

if (-not (Test-Path -LiteralPath $python)) {
    throw "Python environment not found. Follow docs\development.md first."
}

Write-Host "Checking the Python model service…" -ForegroundColor Cyan
Push-Location $modelService
try {
    & $python -m ruff check src tests
    if ($LASTEXITCODE -ne 0) { throw "Python lint failed." }
    & $python -m ruff format --check src tests
    if ($LASTEXITCODE -ne 0) { throw "Python formatting check failed." }
    if ($Network) {
        $env:RUN_HF_COMPAT = "1"
        & $python -m pytest
    } else {
        & $python -m pytest -m "not network"
    }
    if ($LASTEXITCODE -ne 0) { throw "Python tests failed." }
} finally {
    Remove-Item Env:RUN_HF_COMPAT -ErrorAction SilentlyContinue
    Pop-Location
}

Write-Host "Checking the Spring API…" -ForegroundColor Cyan
Push-Location $apiService
try {
    & $maven test
    if ($LASTEXITCODE -ne 0) { throw "Spring tests failed." }
} finally { Pop-Location }

Write-Host "Checking the React frontend…" -ForegroundColor Cyan
Push-Location $frontend
try {
    if (-not (Test-Path -LiteralPath "node_modules")) {
        & npm.cmd ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
    }
    & npm.cmd run check
    if ($LASTEXITCODE -ne 0) { throw "Frontend checks failed." }
} finally { Pop-Location }

Write-Host "All checks passed." -ForegroundColor Green
