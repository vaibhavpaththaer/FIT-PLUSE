# =============================================================================
# FitPulse — JS Build Script
# Concatenates all js/ module files into a single script.js
# Run this whenever you edit any file in js/
# Usage: .\build.ps1
# =============================================================================

$jsDir   = "js"
$outFile = "script.js"
$backup  = "script.js.bak"

# Ordered list of module files (must match dependency order)
$modules = @(
    "state.js",
    "auth.js",
    "register.js",
    "dashboard.js",
    "charts.js",
    "profile.js",
    "messages.js",
    "workouts.js",
    "diet.js",
    "progress.js",
    "settings.js",
    "devices.js",
    "i18n.js",
    "admin.js"
)

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  FitPulse JS Build" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Backup existing script.js
if (Test-Path $outFile) {
    Copy-Item $outFile $backup -Force
    Write-Host "[Backup] $outFile -> $backup" -ForegroundColor DarkGray
}

# Start output with file header
$output = [System.Collections.Generic.List[string]]::new()
$output.Add("/**")
$output.Add(" * FitPulse - Modern Fitness Coaching Platform")
$output.Add(" * AUTO-GENERATED: Run build.ps1 to rebuild from js/ modules")
$output.Add(" * Modules: $($modules -join ', ')")
$output.Add(" */")
$output.Add("")
$output.Add("document.addEventListener('DOMContentLoaded', () => {")
$output.Add("")

# Inject each module
foreach ($mod in $modules) {
    $path = Join-Path $jsDir $mod
    if (-not (Test-Path $path)) {
        Write-Host "[WARN] Missing: $path" -ForegroundColor Yellow
        continue
    }
    $lines = Get-Content $path -Encoding UTF8
    $lineCount = $lines.Count
    $output.Add("    // " + ("=" * 73))
    $output.Add("    // MODULE: $mod ($lineCount lines)")
    $output.Add("    // " + ("=" * 73))
    foreach ($line in $lines) {
        # Skip the module header comments (first 2 lines are our injected header)
        $output.Add($line)
    }
    $output.Add("")
    Write-Host "[OK] $mod ($lineCount lines)" -ForegroundColor Green
}

# Close the DOMContentLoaded wrapper
$output.Add("    checkAuthState();")
$output.Add("")
$output.Add("});")

# Write output
$output | Set-Content $outFile -Encoding UTF8

$totalLines = $output.Count
$sizeKB = [math]::Round((Get-Item $outFile).Length / 1KB, 1)
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Built: $outFile" -ForegroundColor Green
Write-Host "  Total lines : $totalLines" -ForegroundColor White
Write-Host "  File size   : $sizeKB KB" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Restart the server to apply changes:" -ForegroundColor Yellow
Write-Host "  .\server.ps1" -ForegroundColor White
Write-Host ""
