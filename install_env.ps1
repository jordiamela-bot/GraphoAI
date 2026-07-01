# GraphoAI Environment Installer
Write-Host "Installing environment dependencies for GraphoAI..." -ForegroundColor Cyan

# 1. Install Node.js LTS
Write-Host "`n1. Installing Node.js LTS..." -ForegroundColor Yellow
winget install --id OpenJS.NodeJS.LTS --scope user --silent --accept-package-agreements --accept-source-agreements

# 2. Install Python 3.11
Write-Host "`n2. Installing Python 3.11..." -ForegroundColor Yellow
winget install --id Python.Python.3.11 --scope user --silent --accept-package-agreements --accept-source-agreements

# 3. Install Tesseract OCR
Write-Host "`n3. Installing Tesseract OCR..." -ForegroundColor Yellow
# Using UB-Mannheim.TesseractOCR since it installs directly on Windows and registers in registry or default path
winget install --id UB-Mannheim.TesseractOCR --silent --accept-package-agreements --accept-source-agreements

Write-Host "`nInstallation finished. Checking paths..." -ForegroundColor Cyan

# Define typical user paths for Node and Python
$userLocalPrograms = "$env:LOCALAPPDATA\Programs"
$nodePath = "$userLocalPrograms\node"
$pythonPath = "$userLocalPrograms\Python\Python311"
$pythonScriptsPath = "$pythonPath\Scripts"
$tesseractPath = "${env:ProgramFiles}\Tesseract-OCR"

Write-Host "Expected Paths:"
Write-Host "Node: $nodePath"
Write-Host "Python: $pythonPath"
Write-Host "Tesseract: $tesseractPath"
