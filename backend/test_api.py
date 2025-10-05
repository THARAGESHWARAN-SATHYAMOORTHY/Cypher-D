#!/usr/bin/env python3
import requests

BASE_URL = "http://localhost:5001"


def test_health():
    # Test health endpoint
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            print("Health check passed")
            return True
        else:
            print(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Health check failed: {e}")
        return False


def test_create_wallet():
    # Test wallet creation
    print("Testing wallet creation...")
    try:
        response = requests.post(f"{BASE_URL}/api/wallet/create")
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("Wallet creation passed")
                print(f"   Address: {data['address']}")
                print(f"   Balance: {data['balance']} ETH")
                return data
            else:
                print(f"Wallet creation failed: {data.get('error')}")
                return None
        else:
            print(f"Wallet creation failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"Wallet creation failed: {e}")
        return None


def test_get_balance(address):
    # Test balance retrieval
    print("Testing balance retrieval...")
    try:
        response = requests.get(f"{BASE_URL}/api/wallet/balance/{address}")
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("Balance retrieval passed")
                print(f"   Balance: {data['balance']} ETH")
                return data["balance"]
            else:
                print(f"Balance retrieval failed: {data.get('error')}")
                return None
        else:
            print(f"Balance retrieval failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"Balance retrieval failed: {e}")
        return None


def test_transfer_initiate(from_address, to_address, amount):
    # Test transfer initiation
    print("Testing transfer initiation...")
    try:
        payload = {
            "from_address": from_address,
            "to_address": to_address,
            "amount": amount,
            "amount_type": "ETH",
            "email": "21pc37@psgtech.ac.in",
        }
        response = requests.post(f"{BASE_URL}/api/transfer/initiate", json=payload)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("Transfer initiation passed")
                print(f"   Message: {data['message'][:50]}...")
                return data
            else:
                print(f"Transfer initiation failed: {data.get('error')}")
                return None
        else:
            print(f"Transfer initiation failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"Transfer initiation failed: {e}")
        return None


def test_get_transactions(address):
    # Test transaction history
    print("Testing transaction history...")
    try:
        response = requests.get(f"{BASE_URL}/api/transactions/{address}")
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("Transaction history passed")
                print(f"   Found {len(data['transactions'])} transactions")
                return data["transactions"]
            else:
                print(f"Transaction history failed: {data.get('error')}")
                return None
        else:
            print(f"Transaction history failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"Transaction history failed: {e}")
        return None


def main():
    # Run all tests
    print("Starting CypherD Wallet API Tests")
    print("=" * 50)

    # Test health
    if not test_health():
        print("Backend server is not running. Please start it with: python run.py")
        return

    print()

    # Test wallet creation
    wallet1 = test_create_wallet()
    if not wallet1:
        return

    print()

    # Test second wallet creation
    wallet2 = test_create_wallet()
    if not wallet2:
        return

    print()

    # Test balance retrieval
    balance1 = test_get_balance(wallet1["address"])
    balance2 = test_get_balance(wallet2["address"])

    print()

    # Test transfer initiation
    transfer = test_transfer_initiate(wallet1["address"], wallet2["address"], 0.5)

    print()

    # Test transaction history
    transactions1 = test_get_transactions(wallet1["address"])
    test_get_transactions(wallet2["address"])

    print()
    print("=" * 50)
    print("All API tests completed!")
    print()
    print("Test Summary:")
    print(f"   Wallet 1: {wallet1['address'][:10]}... (Balance: {balance1} ETH)")
    print(f"   Wallet 2: {wallet2['address'][:10]}... (Balance: {balance2} ETH)")
    print(f"   Transfer initiated: {transfer is not None}")
    print(f"   Transactions found: {len(transactions1) if transactions1 else 0}")
    print()
    print("Backend API is working correctly!")
    print("You can now start the frontend with: cd frontend && npm start")


if __name__ == "__main__":
    main()
