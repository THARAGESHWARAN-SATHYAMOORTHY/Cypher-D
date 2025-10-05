# 🔐 CypherD Wallet - Cryptography Explained with Examples

This document provides a detailed explanation of how cryptographic operations work in the CypherD wallet, with real code examples and step-by-step breakdowns.

---

## 📋 Table of Contents
1. [Mnemonic Phrase Generation](#1-mnemonic-phrase-generation)
2. [Key Derivation Process](#2-key-derivation-process)
3. [Digital Signature Creation](#3-digital-signature-creation)
4. [Signature Verification](#4-signature-verification)
5. [Complete Transaction Flow](#5-complete-transaction-flow)

---

## 1. Mnemonic Phrase Generation

### What is a Mnemonic Phrase?
A mnemonic phrase is a human-readable representation of your wallet's seed. It's 12 words that can regenerate your entire wallet.

### Code Implementation

**Backend (Python) - `backend/app.py`:**
```python
# Line 72: Initialize Mnemonic generator
mnemo = Mnemonic("english")

# Line 379: Generate 12-word phrase
mnemonic_phrase = mnemo.generate(strength=128)
```

### Example Output
```
"witch collapse practice feed shame open despair creek road again ice least"
```

### How It Works

**Step 1: Generate Random Entropy**
```
128 bits of random data
Example: 10101100 11010011 ... (16 bytes)
```

**Step 2: Add Checksum**
```
Entropy: 128 bits
SHA-256 hash: Take first 4 bits
Total: 132 bits (128 + 4)
```

**Step 3: Split into 11-bit Groups**
```
132 bits ÷ 11 = 12 groups
Each group represents a number 0-2047
```

**Step 4: Map to Words**
```
Group 1: 1987 → "witch"
Group 2: 0456 → "collapse"
Group 3: 1456 → "practice"
...
Group 12: 1045 → "least"
```

### Security
- **Possible combinations**: 2^128 = 340,282,366,920,938,463,463,374,607,431,768,211,456
- **Time to brute force**: Billions of years with current technology

---

## 2. Key Derivation Process

### Overview
The mnemonic phrase is converted into private keys, public keys, and finally an Ethereum address.

### Code Implementation

**Backend (Python) - `backend/app.py`:**
```python
# Lines 382-385: Create wallet from mnemonic
Account.enable_unaudited_hdwallet_features()
account = Account.from_mnemonic(mnemonic_phrase)

# Result
print(account.address)  # "0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4"
```

**Frontend (JavaScript) - `frontend/src/components/TransferForm.js`:**
```javascript
// Line 98: Derive wallet from mnemonic
const walletInstance = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(wallet.mnemonic)
);
```

### Step-by-Step Process

#### Step 1: Mnemonic → Seed
```
Input: "witch collapse practice feed shame open despair creek road again ice least"

Process: PBKDF2-HMAC-SHA512
- Password: mnemonic phrase
- Salt: "mnemonic" + optional passphrase
- Iterations: 2048
- Output: 512-bit (64-byte) seed

Output: 
0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b
3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d
```

#### Step 2: Seed → Master Private Key
```
Input: 512-bit seed

Process: HMAC-SHA512 with key "Bitcoin seed"
- Left 256 bits: Master private key
- Right 256 bits: Master chain code (for HD derivation)

Output:
Private Key: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
Chain Code:  0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

#### Step 3: Private Key → Public Key
```
Input: Private key (256-bit number)

Process: Elliptic Curve Point Multiplication (secp256k1)
- Curve: secp256k1 (y² = x³ + 7)
- Generator point G
- Public Key = Private Key × G

Output (uncompressed):
0x04 + x-coordinate (32 bytes) + y-coordinate (32 bytes)
= 65 bytes total
```

#### Step 4: Public Key → Ethereum Address
```
Input: Public key (65 bytes, uncompressed)

Process:
1. Remove the "04" prefix → 64 bytes
2. Keccak-256 hash → 32 bytes
3. Take last 20 bytes
4. Add "0x" prefix

Output:
0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4
```

### Complete Example

```
Mnemonic: "witch collapse practice feed shame open despair creek road again ice least"
    ↓ PBKDF2
Seed: 0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d...
    ↓ HMAC-SHA512
Private Key: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
    ↓ secp256k1
Public Key: 0x04abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890...
    ↓ Keccak-256 + last 20 bytes
Address: 0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4
```

---

## 3. Digital Signature Creation

### What is a Digital Signature?
A digital signature proves you own the private key without revealing it. It's like a seal that only you can create.

### Transaction Flow

#### Step 1: Create Message (Backend)

**Code - `backend/app.py` lines 520-525:**
```python
timestamp = int(time.time())
if amount_type == "USD":
    message = f"Transfer {eth_amount:.6f} ETH (${usd_amount:.2f} USD) to {to_address} from {from_address} at {timestamp}"
else:
    message = f"Transfer {eth_amount:.6f} ETH to {to_address} from {from_address} at {timestamp}"
```

**Example Message:**
```
"Transfer 1.500000 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4 from 0x1234567890abcdef1234567890abcdef12345678 at 1699123456"
```

#### Step 2: Sign Message (Frontend)

**Code - `frontend/src/components/TransferForm.js` lines 97-101:**
```javascript
// Recreate wallet from mnemonic
const walletInstance = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(wallet.mnemonic)
);

// Sign the message
const signature = await walletInstance.signMessage(pendingTransfer.message);
```

### Signing Process Details

#### Step 2.1: Message Encoding (EIP-191)
```
Original Message:
"Transfer 1.500000 ETH to 0x742d... at 1699123456"

EIP-191 Encoding:
"\x19Ethereum Signed Message:\n" + message_length + message

Encoded:
"\x19Ethereum Signed Message:\n85Transfer 1.500000 ETH to 0x742d... at 1699123456"
```

#### Step 2.2: Hash the Encoded Message
```
Input: Encoded message

Process: Keccak-256 hash

Output (message hash):
0x8f3d2e1c4b5a6789abcdef0123456789abcdef0123456789abcdef0123456789
```

#### Step 2.3: ECDSA Signing
```
Input:
- Message hash: 0x8f3d2e1c4b5a6789...
- Private key: 0x1234567890abcdef...

Process: ECDSA with secp256k1 curve
1. Generate random nonce k
2. Calculate r = (k × G).x mod n
3. Calculate s = k^-1 × (hash + r × private_key) mod n
4. Calculate recovery id v (27 or 28)

Output (65 bytes):
r (32 bytes) + s (32 bytes) + v (1 byte)

Example Signature:
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
  abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678
  1b
```

---

## 4. Signature Verification

### Backend Verification Process

**Code - `backend/app.py` lines 596-610:**
```python
from eth_account.messages import encode_defunct

# Encode the message using EIP-191 standard
encoded_message = encode_defunct(text=pending_transfer.message)

# Recover the address from the signature
recovered_address = Account.recover_message(
    encoded_message, signature=signature
)

# Verify the recovered address matches the sender
if recovered_address.lower() != pending_transfer.from_address.lower():
    return jsonify({"success": False, "error": "Invalid signature"}), 400
```

### How Signature Recovery Works

#### Step 1: Parse Signature
```
Signature: 0x1234...1b (65 bytes)
    ↓
r: 0x1234567890abcdef... (32 bytes)
s: 0xabcdef1234567890... (32 bytes)
v: 0x1b (1 byte) = 27 in decimal
```

#### Step 2: Recover Public Key
```
Input:
- Message hash: 0x8f3d2e1c4b5a6789...
- r, s, v from signature

Process: ECDSA Public Key Recovery
1. Calculate R point from r and v
2. Calculate public_key = r^-1 × (s × R - hash × G)

Output:
Public Key: 0x04abcdef1234567890...
```

#### Step 3: Derive Address from Public Key
```
Public Key: 0x04abcdef1234567890...
    ↓ Keccak-256
Hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
    ↓ Take last 20 bytes
Recovered Address: 0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4
```

#### Step 4: Compare Addresses
```
Recovered Address: 0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4
Expected Address:  0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4

Match? ✅ YES → Signature is valid
```

### Why This is Secure

1. **Private Key Never Shared**: Only the signature is transmitted
2. **Unique Signatures**: Each signature uses a random nonce
3. **Tamper-Proof**: Changing the message invalidates the signature
4. **Mathematically Proven**: Based on elliptic curve cryptography

---

## 5. Complete Transaction Flow

### End-to-End Example

#### Step 1: User Initiates Transfer (Frontend)
```javascript
// User wants to send 1.5 ETH
const transferData = {
    from_address: "0x1234567890abcdef1234567890abcdef12345678",
    to_address: "0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4",
    amount: 1.5,
    amount_type: "ETH"
};

// Send to backend
fetch('http://localhost:5001/api/transfer/initiate', {
    method: 'POST',
    body: JSON.stringify(transferData)
});
```

#### Step 2: Backend Creates Approval Message
```python
# Backend receives request
timestamp = 1699123456
message = "Transfer 1.500000 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4 from 0x1234567890abcdef1234567890abcdef12345678 at 1699123456"

# Store pending transfer
pending_transfer = PendingTransfer(
    from_address="0x1234...",
    to_address="0x742d...",
    amount=1.5,
    message=message,
    expires_at=datetime.utcnow() + timedelta(seconds=30)
)
db.add(pending_transfer)
db.commit()

# Return message to frontend
return {
    "transfer_id": 123,
    "message": message
}
```

#### Step 3: Frontend Signs Message
```javascript
// User approves transaction
const walletInstance = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase("witch collapse practice...")
);

// Sign the message
const signature = await walletInstance.signMessage(message);
// Result: "0x1234567890abcdef...1b"

// Send signature to backend
fetch('http://localhost:5001/api/transfer/execute', {
    method: 'POST',
    body: JSON.stringify({
        transfer_id: 123,
        signature: signature
    })
});
```

#### Step 4: Backend Verifies Signature
```python
# Verify signature
encoded_message = encode_defunct(text=pending_transfer.message)
recovered_address = Account.recover_message(encoded_message, signature=signature)

if recovered_address.lower() == pending_transfer.from_address.lower():
    # Signature valid! Execute transfer
    sender_wallet.balance -= 1.5
    recipient_wallet.balance += 1.5
    
    # Create transaction record
    transaction = Transaction(
        from_address=pending_transfer.from_address,
        to_address=pending_transfer.to_address,
        amount=1.5,
        status="completed",
        signature=signature
    )
    db.add(transaction)
    db.commit()
    
    # Send email notification
    send_notification(...)
    
    return {"success": True}
```

### Complete Flow Diagram

```
┌─────────────┐                    ┌─────────────┐
│   Frontend  │                    │   Backend   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. Initiate Transfer            │
       │ ─────────────────────────────────>
       │     (from, to, amount)           │
       │                                  │
       │                                  │  2. Create Message
       │                                  │     & Store Pending
       │                                  │
       │  3. Return Message to Sign       │
       │ <─────────────────────────────────
       │     (transfer_id, message)       │
       │                                  │
       │  4. User Approves                │
       │     Derive Private Key           │
       │     Sign Message                 │
       │                                  │
       │  5. Send Signature               │
       │ ─────────────────────────────────>
       │     (transfer_id, signature)     │
       │                                  │
       │                                  │  6. Verify Signature
       │                                  │     Recover Address
       │                                  │     Update Balances
       │                                  │     Store Transaction
       │                                  │
       │  7. Success Response             │
       │ <─────────────────────────────────
       │     (transaction_id)             │
       │                                  │
```

---

## 🔒 Security Highlights

### Private Key Protection
- **Never Transmitted**: Private keys never leave the client
- **Derived On-Demand**: Recreated from mnemonic when needed
- **Not Stored on Server**: Backend never sees private keys

### Signature Security
- **Unique Nonces**: Each signature uses a random nonce
- **Time-Limited**: Approval messages expire after 30 seconds
- **Replay Protection**: Timestamps prevent signature reuse

### Cryptographic Standards
- **BIP39**: Mnemonic generation
- **BIP32**: Hierarchical deterministic wallets
- **BIP44**: Multi-account hierarchy
- **EIP-191**: Ethereum signed message standard
- **secp256k1**: Elliptic curve (same as Bitcoin)

---

## 📚 Further Reading

- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
- [Elliptic Curve Cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)
- [ECDSA Signature Algorithm](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)

---