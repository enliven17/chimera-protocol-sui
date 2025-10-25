# Walrus CLI Setup Script for Windows
# This script downloads and installs the Walrus CLI for Windows

param(
    [string]$InstallPath = "$env:USERPROFILE\walrus",
    [switch]$AddToPath = $true,
    [switch]$Force = $false
)

Write-Host "Walrus CLI Setup for Windows" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if Walrus is already installed
try {
    $version = walrus --version 2>$null
    if ($version -and -not $Force) {
        Write-Host "Walrus CLI is already installed!" -ForegroundColor Green
        Write-Host "Version: $version" -ForegroundColor Yellow
        Write-Host "Use -Force to reinstall" -ForegroundColor Gray
        exit 0
    }
} catch {
    Write-Host "Walrus CLI not found, proceeding with installation..." -ForegroundColor Yellow
}

# Create installation directory
if (-not (Test-Path $InstallPath)) {
    Write-Host "Creating installation directory: $InstallPath" -ForegroundColor Blue
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

# Download Walrus CLI
$downloadUrl = "https://storage.googleapis.com/mysten-walrus-binaries/walrus-mainnet-latest-windows-x86_64.exe"
$exePath = Join-Path $InstallPath "walrus.exe"

Write-Host "Downloading Walrus CLI..." -ForegroundColor Blue
Write-Host "URL: $downloadUrl" -ForegroundColor Gray
Write-Host "Destination: $exePath" -ForegroundColor Gray

try {
    # Use Invoke-WebRequest with progress
    $ProgressPreference = 'Continue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath -UseBasicParsing
    Write-Host "Download completed!" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify installation
Write-Host "Verifying installation..." -ForegroundColor Blue
try {
    $version = & $exePath --version
    Write-Host "Installation verified!" -ForegroundColor Green
    Write-Host "Version: $version" -ForegroundColor Yellow
} catch {
    Write-Host "Installation verification failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Add to PATH if requested
if ($AddToPath) {
    Write-Host "Adding Walrus to PATH..." -ForegroundColor Blue
    
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    
    if ($currentPath -notlike "*$InstallPath*") {
        # Add to user PATH
        $newPath = "$currentPath;$InstallPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        
        # Update current session PATH
        $env:PATH += ";$InstallPath"
        
        Write-Host "Added $InstallPath to PATH" -ForegroundColor Green
        Write-Host "You may need to restart your terminal for PATH changes to take effect" -ForegroundColor Yellow
    } else {
        Write-Host "PATH already contains Walrus installation directory" -ForegroundColor Yellow
    }
}

# Create Walrus configuration directory
$configDir = "$env:USERPROFILE\.config\walrus"
if (-not (Test-Path $configDir)) {
    Write-Host "Creating Walrus configuration directory: $configDir" -ForegroundColor Blue
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Download default configuration
$configUrl = "https://docs.wal.app/setup/client_config.yaml"
$configPath = Join-Path $configDir "client_config.yaml"

Write-Host "Downloading Walrus configuration..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $configUrl -OutFile $configPath -UseBasicParsing
    Write-Host "Configuration downloaded!" -ForegroundColor Green
} catch {
    Write-Host "Configuration download failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "You can manually download it from: $configUrl" -ForegroundColor Gray
}

# Test basic functionality
Write-Host "Testing basic functionality..." -ForegroundColor Blue
try {
    $testResult = & $exePath --help
    if ($testResult -match "walrus") {
        Write-Host "Basic functionality test passed!" -ForegroundColor Green
    } else {
        Write-Host "Basic functionality test inconclusive" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Basic functionality test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nWalrus CLI Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Installation Path: $InstallPath" -ForegroundColor Cyan
Write-Host "Executable: $exePath" -ForegroundColor Cyan
Write-Host "Configuration: $configPath" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your terminal or run: refreshenv" -ForegroundColor White
Write-Host "2. Verify installation: walrus --version" -ForegroundColor White
Write-Host "3. Check configuration: walrus config" -ForegroundColor White
Write-Host "4. Test storage: walrus store --help" -ForegroundColor White

Write-Host "`nUseful Commands:" -ForegroundColor Yellow
Write-Host "• walrus store <file>     - Store a file" -ForegroundColor White
Write-Host "• walrus read <blob-id>   - Read a blob" -ForegroundColor White
Write-Host "• walrus list             - List stored blobs" -ForegroundColor White
Write-Host "• walrus info <blob-id>    - Get blob information" -ForegroundColor White

Write-Host "`nDocumentation:" -ForegroundColor Yellow
Write-Host "• Official docs: https://docs.wal.app/" -ForegroundColor White
Write-Host "• Setup guide: https://docs.wal.app/usage/setup.html" -ForegroundColor White
Write-Host "• CLI reference: https://docs.wal.app/usage/client-cli.html" -ForegroundColor White

Write-Host "`nPrerequisites:" -ForegroundColor Yellow
Write-Host "• Sui wallet with SUI tokens for gas" -ForegroundColor White
Write-Host "• WAL tokens for storage costs" -ForegroundColor White
Write-Host "• Sui CLI installed and configured" -ForegroundColor White