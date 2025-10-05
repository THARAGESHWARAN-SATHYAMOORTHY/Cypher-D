#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

if __name__ == "__main__":
    print("Starting CypherD Wallet Backend Server...")
    print("Server will be available at: http://localhost:5001")
    print("API Test: http://localhost:5001/api/health")
    print("Make sure to set up your .env file with email credentials for notifications")
    print()

    app.run(debug=True, host="0.0.0.0", port=5001, threaded=True)
