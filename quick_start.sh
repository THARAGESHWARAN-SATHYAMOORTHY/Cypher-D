#!/bin/bash

# CypherD Wallet Quick Start Script
echo "🚀 CypherD Wallet - Quick Start"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_success "Backend is running"
else
    print_warning "Backend is not running. Starting it now..."
    cd backend
    source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
    pip install -r requirements.txt > /dev/null 2>&1
    python init_db.py > /dev/null 2>&1
    python run.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    print_info "Waiting for backend to start..."
    for i in {1..10}; do
        if curl -s http://localhost:5000/api/health > /dev/null; then
            print_success "Backend started successfully"
            break
        fi
        sleep 2
    done
fi

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Frontend is running"
else
    print_warning "Frontend is not running. Starting it now..."
    cd frontend
    npm install > /dev/null 2>&1
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    print_info "Waiting for frontend to start..."
    sleep 10
    print_success "Frontend started successfully"
fi

echo ""
print_info "🎉 CypherD Wallet is ready!"
echo ""
echo "📍 Access your wallet at: http://localhost:3000"
echo "🔧 Backend API at: http://localhost:5000"
echo "📚 API Health: http://localhost:5000/api/health"
echo ""
print_info "📖 Quick Demo Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Click 'Create New Wallet'"
echo "3. Save your 12-word mnemonic phrase"
echo "4. Explore the dashboard and try sending ETH"
echo ""
print_warning "Press Ctrl+C to stop all services"

# Keep script running and handle cleanup
trap 'echo ""; print_info "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

wait
