[CmdletBinding()]
param([switch]$SkipBuild)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$modelService = Join-Path $projectRoot "services\model-service"
$apiService = Join-Path $projectRoot "services\api"
$frontend = Join-Path $projectRoot "frontend"
$python = Join-Path $modelService ".venv\Scripts\python.exe"
$logDirectory = Join-Path ([System.IO.Path]::GetTempPath()) "epicure-platform"
$children = @()

function Wait-ForEndpoint([string]$url, [string]$name, [int]$timeoutSeconds = 90) {
    $deadline = (Get-Date).AddSeconds($timeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                Write-Host "$name is ready: $url" -ForegroundColor Green
                return
            }
        } catch { Start-Sleep -Seconds 1 }
    }
    throw "$name did not become ready. Check logs in $logDirectory."
}

function Stop-ProcessTree([int]$processId) {
    $descendants = Get-CimInstance Win32_Process -Filter "ParentProcessId = $processId" -ErrorAction SilentlyContinue
    foreach ($descendant in $descendants) {
        Stop-ProcessTree -processId ([int]$descendant.ProcessId)
        Stop-Process -Id ([int]$descendant.ProcessId) -Force -ErrorAction SilentlyContinue
    }
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

try {
    if (-not (Test-Path -LiteralPath $python)) {
        throw "Python environment not found. Run the setup commands in docs\development.md."
    }
    if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        throw "Node.js and npm were not found. Install Node.js 20 or newer."
    }

    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
    if (-not (Test-Path -LiteralPath (Join-Path $frontend "node_modules"))) {
        Write-Host "Installing the frontend dependencies…" -ForegroundColor Cyan
        Push-Location $frontend
        try {
            & npm.cmd ci --no-fund --no-audit
            if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
        } finally { Pop-Location }
    }
    if (-not $SkipBuild) {
        Write-Host "Checking the Python model service…" -ForegroundColor Cyan
        Push-Location $modelService
        try {
            & $python -m ruff check src tests
            if ($LASTEXITCODE -ne 0) { throw "Python lint failed." }
            & $python -m ruff format --check src tests
            if ($LASTEXITCODE -ne 0) { throw "Python formatting check failed." }
            & $python -m pytest -m "not network"
            if ($LASTEXITCODE -ne 0) { throw "Python tests failed." }
        } finally { Pop-Location }
        Write-Host "Checking the Spring API build…" -ForegroundColor Cyan
        Push-Location $apiService
        try {
            & (Join-Path $apiService "mvnw.cmd") -q test
            if ($LASTEXITCODE -ne 0) { throw "Spring tests failed." }
        } finally { Pop-Location }
        Write-Host "Checking the React frontend…" -ForegroundColor Cyan
        Push-Location $frontend
        try {
            & npm.cmd run check
            if ($LASTEXITCODE -ne 0) { throw "Frontend checks failed." }
        } finally { Pop-Location }
    }

    Write-Host "Starting the model service…" -ForegroundColor Cyan
    $modelProcess = Start-Process -FilePath $python -WorkingDirectory $modelService `
        -ArgumentList @("-m", "uvicorn", "epicure_backend.app:app", "--host", "127.0.0.1", "--port", "8000") `
        -RedirectStandardOutput (Join-Path $logDirectory "model-service.log") `
        -RedirectStandardError (Join-Path $logDirectory "model-service.error.log") -PassThru
    $children += $modelProcess
    Wait-ForEndpoint "http://127.0.0.1:8000/health" "Python model service"

    Write-Host "Starting the Spring API…" -ForegroundColor Cyan
    $apiProcess = Start-Process -FilePath (Join-Path $apiService "mvnw.cmd") -WorkingDirectory $apiService `
        -ArgumentList @("spring-boot:run") `
        -RedirectStandardOutput (Join-Path $logDirectory "spring-api.log") `
        -RedirectStandardError (Join-Path $logDirectory "spring-api.error.log") -PassThru
    $children += $apiProcess
    Wait-ForEndpoint "http://127.0.0.1:8080/actuator/health" "Spring API"

    Write-Host "Starting the React frontend…" -ForegroundColor Cyan
    $frontendProcess = Start-Process -FilePath "npm.cmd" -WorkingDirectory $frontend `
        -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "5173") `
        -RedirectStandardOutput (Join-Path $logDirectory "frontend.log") `
        -RedirectStandardError (Join-Path $logDirectory "frontend.error.log") -PassThru
    $children += $frontendProcess
    Wait-ForEndpoint "http://127.0.0.1:5173/" "React frontend"

    Write-Host ""
    Write-Host "Kitchen Compass is ready." -ForegroundColor Green
    Write-Host "Frontend: http://127.0.0.1:5173/"
    Write-Host "Logs:     $logDirectory"
    Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Yellow

    while ($true) {
        foreach ($endpoint in @(
            "http://127.0.0.1:8000/health",
            "http://127.0.0.1:8080/actuator/health",
            "http://127.0.0.1:5173/"
        )) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint -UseBasicParsing -TimeoutSec 3
                if ($response.StatusCode -ge 500) { throw "Service returned HTTP $($response.StatusCode)." }
            } catch {
                throw "A service stopped unexpectedly. Check logs in $logDirectory."
            }
        }
        Start-Sleep -Seconds 2
    }
} finally {
    foreach ($child in $children) {
        if ($child) { Stop-ProcessTree -processId $child.Id }
    }
}
