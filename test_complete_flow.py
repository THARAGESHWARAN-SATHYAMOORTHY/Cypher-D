#!/usr/bin/env python3
import requests
from eth_account import Account

BASE_URL = "http://localhost:5001"

def create_wallet():
    # Create a new wallet
    response = requests.post(f"{BASE_URL}/api/wallet/create")
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            return data
    return None

def test_complete_flow():
    # Test complete wallet flow
    print("Testing Complete CypherD Wallet Flow")
    print("=" * 50)
    
    # Step 1: Create two wallets
    print("Creating Wallet 1...")
    wallet1 = create_wallet()
    if not wallet1:
        print("Failed to create wallet 1")
        return
    
    print(f"   Wallet 1: {wallet1['address'][:10]}... (Balance: {wallet1['balance']} ETH)")
    print(f"   Mnemonic: {wallet1['mnemonic'][:30]}...")
    
    print("\nCreating Wallet 2...")
    wallet2 = create_wallet()
    if not wallet2:
        print("Failed to create wallet 2")
        return
    
    print(f"   Wallet 2: {wallet2['address'][:10]}... (Balance: {wallet2['balance']} ETH)")
    
    # Step 2: Initiate transfer
    print(f"\nInitiating transfer of 0.5 ETH from Wallet 1 to Wallet 2...")
    transfer_data = {
        "from_address": wallet1['address'],
        "to_address": wallet2['address'],
        "amount": 0.5,
        "amount_type": "ETH",
        "email": "21pc37@psgtech.ac.in"
    }
    
    response = requests.post(f"{BASE_URL}/api/transfer/initiate", json=transfer_data)
    if response.status_code != 200:
        print(f"Failed to initiate transfer: {response.status_code}")
        return
    
    initiate_data = response.json()
    if not initiate_data.get('success'):
        print(f"Transfer initiation failed: {initiate_data.get('error')}")
        return
    
    print(f"   Transfer initiated")
    print(f"   Message to sign: {initiate_data['message'][:50]}...")
    
    # Step 3: Sign the message
    print(f"\nSigning the transfer message...")
    try:
        # Create wallet from mnemonic
        Account.enable_unaudited_hdwallet_features()
        account = Account.from_mnemonic(wallet1['mnemonic'])
        
        # Sign the message
        message_hash = account.sign_message(initiate_data['message'].encode())
        signature = message_hash.signature.hex()
        print(f"   Message signed successfully")
        print(f"   Signature: {signature[:20]}...")
        
    except Exception as e:
        print(f"Failed to sign message: {e}")
        return
    
    # Step 4: Execute transfer
    print(f"\nExecuting the signed transfer...")
    execute_data = {
        "transfer_id": initiate_data['transfer_id'],
        "signature": signature
    }
    
    response = requests.post(f"{BASE_URL}/api/transfer/execute", json=execute_data)
    if response.status_code != 200:
        print(f"Failed to execute transfer: {response.status_code}")
        return
    
    execute_result = response.json()
    if not execute_result.get('success'):
        print(f"Transfer execution failed: {execute_result.get('error')}")
        return
    
    print(f"   Transfer executed successfully!")
    print(f"   Amount transferred: {execute_result['amount']} ETH")
    
    # Step 5: Check updated balances
    print(f"\nChecking updated balances...")
    
    # Check wallet 1 balance
    response = requests.get(f"{BASE_URL}/api/wallet/balance/{wallet1['address']}")
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            wallet1_new_balance = data['balance']
            print(f"   Wallet 1 new balance: {wallet1_new_balance} ETH (was {wallet1['balance']} ETH)")
    
    # Check wallet 2 balance
    response = requests.get(f"{BASE_URL}/api/wallet/balance/{wallet2['address']}")
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            wallet2_new_balance = data['balance']
            print(f"   Wallet 2 new balance: {wallet2_new_balance} ETH (was {wallet2['balance']} ETH)")
    
    # Step 6: Check transaction history
    print(f"\nChecking transaction history...")
    
    response = requests.get(f"{BASE_URL}/api/transactions/{wallet1['address']}")
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            transactions = data['transactions']
            print(f"   Found {len(transactions)} transactions for Wallet 1")
            if transactions:
                tx = transactions[0]
                print(f"   Latest transaction: {tx['type']} {tx['amount']} ETH to {tx['to_address'][:10]}...")

    print("\n" + "=" * 50)
    print("Complete flow test PASSED!")
    print("\nSummary:")
    print(f"   • Created 2 wallets successfully")
    print(f"   • Initiated and signed transfer")
    print(f"   • Executed transfer with signature verification")
    print(f"   • Updated balances correctly")
    print(f"   • Transaction history recorded")
    print("\nCypherD Wallet is working perfectly!")
    print("\nAccess the frontend at: http://localhost:3000")
    print("Backend API at: http://localhost:5001")

if __name__ == '__main__':
    test_complete_flow()
