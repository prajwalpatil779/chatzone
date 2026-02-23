@echo off
REM Start both backend and frontend for Windows

echo Starting ChatZone Pro...
echo.

REM Start backend
echo Starting Backend...
start cmd /k "cd backend && npm start"

timeout /t 2 /nobreak

REM Start frontend
echo Starting Frontend...
start cmd /k "cd frontend && npm start"

echo.
echo ✅ ChatZone Pro is running!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close the command windows to stop the servers
