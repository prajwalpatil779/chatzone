@echo off
REM ChatZone Pro Setup Script for Windows

echo 🚀 ChatZone Pro Setup Script
echo ==============================
echo.

REM Check Node.js installation
echo 📦 Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install it from https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Check npm installation
echo 📦 Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed.
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm version: %NPM_VERSION%
echo.

REM Backend setup
echo 🔧 Setting up Backend...
cd backend
echo 📥 Installing backend dependencies...
call npm install

if not exist .env (
    echo ⚠️ Creating .env file...
    echo Please update backend\.env with your credentials
)

cd ..
echo ✅ Backend setup completed
echo.

REM Frontend setup
echo 🔧 Setting up Frontend...
cd frontend
echo 📥 Installing frontend dependencies...
call npm install

if not exist .env (
    echo ⚠️ Creating .env file...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
        echo REACT_APP_SOCKET_URL=http://localhost:5000
        echo REACT_APP_FIREBASE_API_KEY=
        echo REACT_APP_FIREBASE_PROJECT_ID=
    ) > .env
    echo ⚠️ Please update frontend\.env with your credentials
)

cd ..
echo ✅ Frontend setup completed
echo.

echo ==============================
echo ✅ Setup completed!
echo.
echo To start the application:
echo 1. Backend: cd backend ^&^& npm start
echo 2. Frontend: cd frontend ^&^& npm start
echo.
echo Or use Docker:
echo docker-compose up
