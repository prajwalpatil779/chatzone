#!/bin/bash

# Start both backend and frontend

echo "Starting ChatZone Pro..."
echo ""

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Start backend
echo -e "${GREEN}Starting Backend...${NC}"
cd backend
npm start &
BACKEND_PID=$!

sleep 2

# Start frontend  
echo -e "${GREEN}Starting Frontend...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ ChatZone Pro is running!${NC}"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
