# Lectra + AR3D Engine — startup script

Write-Host "Starting Lectra AR3D Stack..." -ForegroundColor Cyan

# Backend (port 8000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; pip install -r requirements.txt -q; uvicorn main:app --host 0.0.0.0 --port 8000"

Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: npm run dev (port 5173)" -ForegroundColor Green
Write-Host ""
Write-Host "Optional AR3D GPU engine: cd ..\ar3d-engine && uvicorn app.main:app --port 8100" -ForegroundColor Yellow
