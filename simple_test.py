#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:5001"

def test_wallet_creation():
    # Test wallet creation
    print("Testing wallet creation...")
    
    response = requests.post(f"{BASE_URL}/api/wallet/create")
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"Wallet created: {data['address'][:10]}...")
            print(f"Balance: {data['balance']} ETH")
            print(f"Mnemonic: {data['mnemonic'][:30]}...")
            return data
        else:
            print(f"Wallet creation failed: {data.get('error')}")
    else:
        print(f"HTTP error: {response.status_code}")
    
    return None

def test_balance():
    # Test balance retrieval
    print("\nTesting balance retrieval...")
    
    # Create a wallet first
    wallet = test_wallet_creation()
    if not wallet:
        return
    
    # Get balance
    response = requests.get(f"{BASE_URL}/api/wallet/balance/{wallet['address']}")
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"Balance retrieved: {data['balance']} ETH")
        else:
            print(f"Balance retrieval failed: {data.get('error')}")
    else:
        print(f"HTTP error: {response.status_code}")

def test_transfer_initiation():
    # Test transfer initiation
    print("\nTesting transfer initiation...")
    
    # Create two wallets
    wallet1 = test_wallet_creation()
    wallet2 = test_wallet_creation()
    
    if not wallet1 or not wallet2:
        print("Failed to create wallets for transfer test")
        return
    
    # Initiate transfer
    transfer_data = {
        "from_address": wallet1['address'],
        "to_address": wallet2['address'],
        "amount": 0.5,
        "amount_type": "ETH",
        "email": "21pc37@psgtech.ac.in"
    }
    
    response = requests.post(f"{BASE_URL}/api/transfer/initiate", json=transfer_data)
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"Transfer initiated successfully")
            print(f"Message: {data['message'][:50]}...")
            print(f"Transfer ID: {data['transfer_id']}")
            return data
        else:
            print(f"Transfer initiation failed: {data.get('error')}")
    else:
        print(f"HTTP error: {response.status_code}")

    return None

def main():
    # Run all tests
    print("CypherD Wallet Simple Tests")
    print("=" * 40)
    
    # Test 1: Wallet creation
    test_wallet_creation()
    
    # Test 2: Balance retrieval
    test_balance()
    
    # Test 3: Transfer initiation
    test_transfer_initiation()
    
    print("\n" + "=" * 40)
    print("Simple tests completed!")
    print("\nFrontend: http://localhost:3000")
    print("Backend: http://localhost:5001")
    print("\nNote: Transfer execution requires frontend for signing")

if __name__ == '__main__':
    main()
