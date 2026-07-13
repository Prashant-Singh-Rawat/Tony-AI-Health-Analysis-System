@echo off
REM ===================================================
REM  Heart AI System - Auto Startup Script
REM  Starts both Frontend (Vite) and Backend (FastAPI)
REM ===================================================

echo Starting Heart AI System...

REM Start Backend
start "Heart-AI-Backend" /min "%~dp0start-backend.bat"

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

REM Start Frontend
start "Heart-AI-Frontend" /min cmd /c "cd /d C:\Users\prash\OneDrive\Documents\Heart-AI-System\frontend && npx vite --host"

echo.
echo ✅ Heart AI System is now running!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000
echo.
echo (Both servers are running in the background)
