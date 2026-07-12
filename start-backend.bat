@echo off
cd /d "%~dp0backend"
C:\Users\prash\AppData\Local\Microsoft\WindowsApps\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
