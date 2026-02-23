#!/bin/bash

# ChatZone Pro Setup Script
# This script sets up the entire project

echo "🚀 ChatZone Pro Setup Script"
echo "=============================="
echo ""

# Check Node.js installation
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"
echo ""

# Check npm installation
echo "📦 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm version: $(npm --version)"
echo ""

# Backend setup
echo "🔧 Setting up Backend..."
cd backend
echo "📥 Installing backend dependencies..."
npm install

if [ ! -f .env ]; then
    echo "⚠️ Creating .env file from template..."
    cp .env.example .env 2>/dev/null || echo "⚠️ .env.example not found. Creating .env..."
    echo "⚠️ Please update backend/.env with your credentials"
fi

cd ..
echo "✅ Backend setup completed"
echo ""

# Frontend setup
echo "🔧 Setting up Frontend..."
cd frontend
echo "📥 Installing frontend dependencies..."
npm install

if [ ! -f .env ]; then
    echo "⚠️ Creating .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_PROJECT_ID=
EOF
    echo "⚠️ Please update frontend/.env with your credentials"
fi

cd ..
echo "✅ Frontend setup completed"
echo ""

echo "==============================="
echo "✅ Setup completed!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Or use Docker:"
echo "docker-compose up"
