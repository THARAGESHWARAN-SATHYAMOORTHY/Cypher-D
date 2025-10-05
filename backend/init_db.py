#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import Base, engine


def init_database():
    # Create all database tables
    print("Initializing CypherD Wallet Database...")

    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        print("Created tables:")
        print("   - wallets")
        print("   - transactions")
        print("   - pending_transfers")
        print()
        print("You can now start the server with: python run.py")

    except Exception as e:
        print(f"Error creating database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    init_database()
