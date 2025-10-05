#!/usr/bin/env python3
import sqlite3
import json
from datetime import datetime

def view_database():
    # View all data in the CypherD Wallet database
    try:
        # Connect to database
        conn = sqlite3.connect('backend/wallet.db')
        cursor = conn.cursor()
        
        print("🗄️  CypherD Wallet Database Viewer")
        print("=" * 50)
        
        # View Wallets
        print("\n📊 WALLETS")
        print("-" * 30)
        cursor.execute("SELECT * FROM wallets ORDER BY created_at DESC")
        wallets = cursor.fetchall()
        
        if wallets:
            for wallet in wallets:
                print(f"ID: {wallet[0]}")
                print(f"Address: {wallet[1]}")
                print(f"Balance: {wallet[2]} ETH")
                print(f"Created: {wallet[3]}")
                print("-" * 30)
        else:
            print("No wallets found")
        
        # View Transactions
        print("\n📝 TRANSACTIONS")
        print("-" * 30)
        cursor.execute("SELECT * FROM transactions ORDER BY created_at DESC")
        transactions = cursor.fetchall()
        
        if transactions:
            for tx in transactions:
                print(f"ID: {tx[0]}")
                print(f"From: {tx[1]}")
                print(f"To: {tx[2]}")
                print(f"Amount: {tx[3]} ETH")
                print(f"USD: {tx[4] if tx[4] else 'N/A'}")
                print(f"Status: {tx[5]}")
                print(f"Created: {tx[7]}")
                print("-" * 30)
        else:
            print("No transactions found")
        
        # View Pending Transfers
        print("\n⏳ PENDING TRANSFERS")
        print("-" * 30)
        cursor.execute("SELECT * FROM pending_transfers ORDER BY created_at DESC")
        pending = cursor.fetchall()
        
        if pending:
            for p in pending:
                print(f"ID: {p[0]}")
                print(f"From: {p[1]}")
                print(f"To: {p[2]}")
                print(f"Amount: {p[3]} ETH")
                print(f"USD: {p[4] if p[4] else 'N/A'}")
                print(f"Expires: {p[6]}")
                print("-" * 30)
        else:
            print("No pending transfers")
        
        # Summary
        print(f"\n📈 SUMMARY")
        print(f"Total Wallets: {len(wallets)}")
        print(f"Total Transactions: {len(transactions)}")
        print(f"Pending Transfers: {len(pending)}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error viewing database: {e}")

if __name__ == '__main__':
    view_database()
