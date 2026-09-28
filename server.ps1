# =============================================================================
# FITPULSE FITNESS PLATFORM — AUTOMATED BUILD & APPSERVER RUNNER
# =============================================================================

Write-Host "Compiling FitPulse Java Backend Sources..." -ForegroundColor Cyan
if (-not (Test-Path "build\classes")) {
    New-Item -ItemType Directory -Force -Path "build\classes" | Out-Null
}

$compileCmd = 'javac -encoding UTF-8 -cp "lib/*;bin;build/classes" -d build/classes src/model/*.java src/dao/*.java src/service/*.java src/controller/*.java src/filter/*.java src/util/*.java'
Invoke-Expression $compileCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilation Succeeded! Starting AppServer..." -ForegroundColor Green
    Start-Process "http://localhost:8080/"
    java -cp "lib/*;build/classes" util.AppServer
} else {
    Write-Host "Compilation failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
