# GraphoAI Project Runner
Write-Host "Starting GraphoAI Application..." -ForegroundColor Cyan

# Define local paths
$nodePath = "C:\Users\Usuario\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.18.0-win-x64"

# 1. Start Backend in a new window
Write-Host "Launching Backend API Server on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "venv\Scripts\python.exe main.py" -WorkingDirectory "backend"

# 2. Start Frontend in a new window
Write-Host "Launching Frontend Dev Server on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = '$nodePath;' + `$env:Path; npm.cmd run dev" -WorkingDirectory "frontend"

# 3. Wait a moment for Vite to start and open the browser
Start-Sleep -Seconds 2
Write-Host "Opening http://localhost:5173/ in the browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/"
