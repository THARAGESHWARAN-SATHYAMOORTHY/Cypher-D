#!/bin/bash

# CypherD Wallet Setup Script
echo "🚀 Setting up CypherD Wallet..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

print_status "Python and Node.js are installed"

# Setup backend
print_info "Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
print_info "Installing Python dependencies..."
pip install -r requirements.txt

# Initialize database
print_info "Initializing database..."
python init_db.py

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit backend/.env file with your email credentials for notifications"
fi

print_status "Backend setup complete"

# Setup frontend
print_info "Setting up frontend..."
cd ../frontend

# Install Node.js dependencies
print_info "Installing Node.js dependencies..."
npm install

print_status "Frontend setup complete"

# Go back to root directory
cd ..

print_status "Setup complete!"
echo ""
print_info "To start the application:"
echo "1. Backend: cd backend && source venv/bin/activate && python run.py"
echo "2. Frontend: cd frontend && npm start"
echo ""
print_info "The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
print_warning "Don't forget to configure your email settings in backend/.env for notifications!"
