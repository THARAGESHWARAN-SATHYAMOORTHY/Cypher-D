import os
import time
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from eth_account import Account
from mnemonic import Mnemonic
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///wallet.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database Models
class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, unique=True, index=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    from_address = Column(String, index=True)
    to_address = Column(String, index=True)
    amount = Column(Float)
    amount_usd = Column(Float, nullable=True)
    status = Column(String, default="pending")
    signature = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PendingTransfer(Base):
    __tablename__ = "pending_transfers"

    id = Column(Integer, primary_key=True, index=True)
    from_address = Column(String)
    to_address = Column(String)
    amount = Column(Float)
    amount_usd = Column(Float, nullable=True)
    message = Column(Text)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create tables
Base.metadata.create_all(bind=engine)

# Initialize Mnemonic
mnemo = Mnemonic("english")

# Email configuration
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")


def send_notification(
    to_email, subject, transfer_amount, transfer_to_address, transfer_from_address
):
    # Send email notification
    if not EMAIL_USER or not EMAIL_PASS:
        print(f"Email notification would be sent to {to_email}: {subject}")
        return

    # Create professional HTML email template
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transfer Successful - CypherD Wallet</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }}
            .header .subtitle {{
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .success-icon {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .success-icon .icon {{
                width: 80px;
                height: 80px;
                background-color: #4CAF50;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                color: white;
            }}
            .transaction-details {{
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #4CAF50;
            }}
            .detail-row:last-child {{
                border-bottom: none;
            }}
            .detail-label {{
                font-weight: 600;
                color: #495057;
                min-width: 120px;
            }}
            .detail-value {{
                font-family: 'Courier New', monospace;
                background-color: #ffffff;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #dee2e6;
                word-break: break-all;
                flex: 1;
                margin-left: 15px;
                text-align: left;
                min-width: 0;
                line-height: 1.4;
            }}
            .detail-row {{
                display: flex;
                align-items: flex-start;
                padding: 12px 0;
                border-bottom: 1px solid #e9ecef;
                min-height: auto;
            }}
            .amount-highlight {{
                font-size: 24px;
                font-weight: bold;
                color: #4CAF50;
                text-align: center;
                margin: 20px 0;
                padding: 20px;
                background-color: #e8f5e8;
                border-radius: 8px;
                border: 2px solid #4CAF50;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }}
            .footer p {{
                margin: 5px 0;
                color: #6c757d;
                font-size: 14px;
            }}
            .footer .logo {{
                font-weight: bold;
                color: #667eea;
                font-size: 18px;
            }}
            .timestamp {{
                color: #6c757d;
                font-size: 12px;
                text-align: center;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Transfer Successful!</h1>
                <p class="subtitle">Your transaction has been completed successfully</p>
            </div>
            
            <div class="content">
                
                <div class="amount-highlight">
                    {transfer_amount:.6f} ETH
                </div>
                
                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">From:</span>
                        <span class="detail-value">{transfer_from_address}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">To:</span>
                        <span class="detail-value">{transfer_to_address}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value">{transfer_amount:.6f} ETH</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value" style="color: #4CAF50; font-weight: bold;">✅ Completed</span>
                    </div>
                </div>
                
                <p style="text-align: center; color: #6c757d; margin-top: 30px;">
                    Your transaction has been successfully processed and recorded on the blockchain.
                    You can view the full transaction history in your CypherD Wallet dashboard.
                </p>
            </div>
            
            <div class="footer">
                <p class="logo">CypherD Wallet</p>
                <p>Secure • Fast • Reliable</p>
                <p>Thank you for using CypherD Wallet for your cryptocurrency transactions.</p>
                <div class="timestamp">
                    Transaction completed on {datetime.now().strftime('%B %d, %Y at %I:%M %p UTC')}
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    # Plain text version for email clients that don't support HTML
    text_body = f"""
    TRANSFER SUCCESSFUL - CypherD Wallet
    
    Your transaction has been completed successfully!
    
    Transaction Details:
    ===================
    From: {transfer_from_address}
    To: {transfer_to_address}
    Amount: {transfer_amount:.6f} ETH
    Status: ✅ Completed
    
    Your transaction has been successfully processed and recorded on the blockchain.
    You can view the full transaction history in your CypherD Wallet dashboard.
    
    Transaction completed on {datetime.now().strftime('%B %d, %Y at %I:%M %p UTC')}
    
    ---
    CypherD Wallet
    Secure • Fast • Reliable
    Thank you for using CypherD Wallet for your cryptocurrency transactions.
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = EMAIL_USER
        msg["To"] = to_email
        msg["Subject"] = subject

        # Create plain text and HTML versions
        text_part = MIMEText(text_body, "plain", "utf-8")
        html_part = MIMEText(html_body, "html", "utf-8")

        # Attach both versions
        msg.attach(text_part)
        msg.attach(html_part)

        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        text = msg.as_string()
        server.sendmail(EMAIL_USER, to_email, text)
        server.quit()
        print(f"Professional email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")


def get_eth_price_from_usd(usd_amount):
    # Get ETH amount from USD using Skip API
    try:
        # USDC contract address on Ethereum mainnet
        usdc_address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

        payload = {
            "source_asset_denom": usdc_address,
            "source_asset_chain_id": "1",
            "dest_asset_denom": "ethereum-native",
            "dest_asset_chain_id": "1",
            "amount_in": str(int(usd_amount * 1e6)),  # USDC has 6 decimals
            "chain_ids_to_addresses": {
                "1": "0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4"
            },
            "slippage_tolerance_percent": "1",
            "smart_swap_options": {"evm_swaps": True},
            "allow_unsafe": False,
        }

        response = requests.post(
            "https://api.skip.build/v2/fungible/msgs_direct", json=payload, timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            # Extract ETH amount from response
            if "msgs" in data and len(data["msgs"]) > 0:
                # The response contains the swap message, we need to extract the ETH amount
                # This is a simplified extraction - in reality you'd parse the message properly
                return float(usd_amount / 2000)  # Simplified: assume $2000 per ETH
            else:
                return float(usd_amount / 2000)  # Fallback
        else:
            return float(usd_amount / 2000)  # Fallback rate

    except Exception as e:
        print(f"Error getting ETH price: {e}")
        return float(usd_amount / 2000)  # Fallback rate


def get_current_eth_price():
    # Get current ETH price for verification
    try:
        response = requests.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
            timeout=5,
        )
        if response.status_code == 200:
            data = response.json()
            return data["ethereum"]["usd"]
        return 2000  # Fallback
    except:
        return 2000  # Fallback


@app.route("/api/wallet/create", methods=["POST"])
def create_wallet():
    # Create a new wallet with mnemonic phrase
    try:
        # Generate mnemonic
        mnemonic_phrase = mnemo.generate(strength=128)

        # Enable mnemonic-based HD wallet
        Account.enable_unaudited_hdwallet_features()

        # Create account from mnemonic
        account = Account.from_mnemonic(mnemonic_phrase)

        # Generate random initial balance (1-10 ETH)
        initial_balance = round(random.uniform(1.0, 10.0), 4)

        # Save to database
        db = SessionLocal()
        wallet = Wallet(address=account.address, balance=initial_balance)
        db.add(wallet)
        db.commit()
        db.close()

        return jsonify(
            {
                "success": True,
                "address": account.address,
                "mnemonic": mnemonic_phrase,
                "balance": initial_balance,
                "message": "Wallet created successfully",
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/wallet/import", methods=["POST"])
def import_wallet():
    # Import existing wallet from mnemonic
    try:
        data = request.get_json()
        mnemonic_phrase = data.get("mnemonic", "").strip()

        if not mnemonic_phrase:
            return (
                jsonify({"success": False, "error": "Mnemonic phrase is required"}),
                400,
            )

        # Validate mnemonic
        if not mnemo.check(mnemonic_phrase):
            return jsonify({"success": False, "error": "Invalid mnemonic phrase"}), 400

        # Create account from mnemonic
        Account.enable_unaudited_hdwallet_features()
        account = Account.from_mnemonic(mnemonic_phrase)

        # Check if wallet exists in database
        db = SessionLocal()
        existing_wallet = (
            db.query(Wallet).filter(Wallet.address == account.address).first()
        )

        if existing_wallet:
            db.close()
            return jsonify(
                {
                    "success": True,
                    "address": account.address,
                    "balance": existing_wallet.balance,
                    "message": "Wallet imported successfully",
                }
            )
        else:
            # Create new wallet with random balance
            initial_balance = round(random.uniform(1.0, 10.0), 4)
            wallet = Wallet(address=account.address, balance=initial_balance)
            db.add(wallet)
            db.commit()
            db.close()

            return jsonify(
                {
                    "success": True,
                    "address": account.address,
                    "balance": initial_balance,
                    "message": "Wallet imported successfully",
                }
            )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/wallet/balance/<address>", methods=["GET"])
def get_balance(address):
    # Get wallet balance
    try:
        db = SessionLocal()
        wallet = db.query(Wallet).filter(Wallet.address == address).first()
        db.close()

        if not wallet:
            return jsonify({"success": False, "error": "Wallet not found"}), 404

        return jsonify({"success": True, "address": address, "balance": wallet.balance})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/transfer/initiate", methods=["POST"])
def initiate_transfer():
    # Initiate a transfer and return message for signing
    try:
        data = request.get_json()
        from_address = data.get("from_address")
        to_address = data.get("to_address")
        amount = data.get("amount")
        amount_type = data.get("amount_type", "ETH")  # 'ETH' or 'USD'
        data.get("email", "21pc37@psgtech.ac.in")

        if not all([from_address, to_address, amount]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        # Check if sender wallet exists
        db = SessionLocal()
        sender_wallet = db.query(Wallet).filter(Wallet.address == from_address).first()
        if not sender_wallet:
            db.close()
            return jsonify({"success": False, "error": "Sender wallet not found"}), 404

        # Convert USD to ETH if needed
        eth_amount = float(amount)
        usd_amount = None

        if amount_type == "USD":
            usd_amount = float(amount)
            eth_amount = get_eth_price_from_usd(usd_amount)

            # Check if sender has enough balance
            if sender_wallet.balance < eth_amount:
                db.close()
                return jsonify({"success": False, "error": "Insufficient balance"}), 400

        # Create approval message
        timestamp = int(time.time())
        if amount_type == "USD":
            message = f"Transfer {eth_amount:.6f} ETH (${usd_amount:.2f} USD) to {to_address} from {from_address} at {timestamp}"
        else:
            message = f"Transfer {eth_amount:.6f} ETH to {to_address} from {from_address} at {timestamp}"

        # Store pending transfer
        expires_at = datetime.utcnow() + timedelta(seconds=30)
        pending_transfer = PendingTransfer(
            from_address=from_address,
            to_address=to_address,
            amount=eth_amount,
            amount_usd=usd_amount,
            message=message,
            expires_at=expires_at,
        )

        db.add(pending_transfer)
        db.commit()
        transfer_id = pending_transfer.id
        db.close()

        return jsonify(
            {
                "success": True,
                "message": message,
                "transfer_id": transfer_id,
                "from_address": from_address,
                "to_address": to_address,
                "amount": eth_amount,
                "amount_usd": usd_amount,
                "expires_at": expires_at.isoformat(),
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/transfer/execute", methods=["POST"])
def execute_transfer():
    # Execute a signed transfer
    try:
        data = request.get_json()
        transfer_id = data.get("transfer_id")
        signature = data.get("signature")

        if not transfer_id or not signature:
            return (
                jsonify(
                    {"success": False, "error": "Missing transfer ID or signature"}
                ),
                400,
            )

        db = SessionLocal()

        # Get pending transfer
        pending_transfer = (
            db.query(PendingTransfer).filter(PendingTransfer.id == transfer_id).first()
        )
        if not pending_transfer:
            db.close()
            return (
                jsonify({"success": False, "error": "Transfer not found or expired"}),
                404,
            )

        # Check if expired
        if datetime.utcnow() > pending_transfer.expires_at:
            db.delete(pending_transfer)
            db.commit()
            db.close()
            return jsonify({"success": False, "error": "Transfer expired"}), 400

        # Verify signature using EIP-191 message encoding (compatible with ethers.js v6)
        try:
            from eth_account.messages import encode_defunct

            # Encode the message using EIP-191 standard (same as ethers.js v6)
            encoded_message = encode_defunct(text=pending_transfer.message)

            # Recover the address from the signature
            recovered_address = Account.recover_message(
                encoded_message, signature=signature
            )

            if recovered_address.lower() != pending_transfer.from_address.lower():
                db.close()
                return jsonify({"success": False, "error": "Invalid signature"}), 400
        except Exception as e:
            db.close()
            return (
                jsonify(
                    {
                        "success": False,
                        "error": f"Signature verification failed: {str(e)}",
                    }
                ),
                400,
            )

        # For USD transfers, verify price hasn't changed significantly
        if pending_transfer.amount_usd:
            current_eth_price = get_current_eth_price()
            original_eth_price = pending_transfer.amount_usd / pending_transfer.amount
            price_change_percent = (
                abs(current_eth_price - original_eth_price) / original_eth_price * 100
            )

            if price_change_percent > 1.0:  # 1% tolerance
                db.delete(pending_transfer)
                db.commit()
                db.close()
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "Price change too large, transaction cancelled for safety",
                        }
                    ),
                    400,
                )

        # Check balances
        sender_wallet = (
            db.query(Wallet)
            .filter(Wallet.address == pending_transfer.from_address)
            .first()
        )
        if sender_wallet.balance < pending_transfer.amount:
            db.delete(pending_transfer)
            db.commit()
            db.close()
            return jsonify({"success": False, "error": "Insufficient balance"}), 400

        # Get or create recipient wallet
        recipient_wallet = (
            db.query(Wallet)
            .filter(Wallet.address == pending_transfer.to_address)
            .first()
        )
        if not recipient_wallet:
            recipient_wallet = Wallet(address=pending_transfer.to_address, balance=0.0)
            db.add(recipient_wallet)

        # Update balances
        sender_wallet.balance -= pending_transfer.amount
        recipient_wallet.balance += pending_transfer.amount

        # Store values before deleting the pending transfer
        transfer_amount = pending_transfer.amount
        transfer_to_address = pending_transfer.to_address
        transfer_amount_usd = pending_transfer.amount_usd

        # Create transaction record
        transaction = Transaction(
            from_address=pending_transfer.from_address,
            to_address=pending_transfer.to_address,
            amount=pending_transfer.amount,
            amount_usd=pending_transfer.amount_usd,
            status="completed",
            signature=signature,
        )
        db.add(transaction)

        # Remove pending transfer
        db.delete(pending_transfer)
        db.commit()

        # Store transaction ID before closing session
        transaction_id = transaction.id

        db.close()

        # Send notification (using stored values)
        send_notification(
            to_email="21pc37@psgtech.ac.in",  # In real app, get from user profile
            subject="🎉 Transfer Successful - CypherD Wallet",
            transfer_amount=transfer_amount,
            transfer_to_address=transfer_to_address,
            transfer_from_address=pending_transfer.from_address,
        )

        return jsonify(
            {
                "success": True,
                "transaction_id": transaction_id,
                "amount": transfer_amount,
                "amount_usd": transfer_amount_usd,
                "message": "Transfer completed successfully",
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/transactions/<address>", methods=["GET"])
def get_transactions(address):
    # Get transaction history for an address
    try:
        db = SessionLocal()
        transactions = (
            db.query(Transaction)
            .filter(
                (Transaction.from_address == address)
                | (Transaction.to_address == address)
            )
            .order_by(Transaction.created_at.desc())
            .all()
        )
        db.close()

        transaction_list = []
        for tx in transactions:
            transaction_list.append(
                {
                    "id": tx.id,
                    "from_address": tx.from_address,
                    "to_address": tx.to_address,
                    "amount": tx.amount,
                    "amount_usd": tx.amount_usd,
                    "status": tx.status,
                    "created_at": tx.created_at.isoformat(),
                    "type": (
                        "sent"
                        if tx.from_address.lower() == address.lower()
                        else "received"
                    ),
                }
            )

        return jsonify({"success": True, "transactions": transaction_list})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    # Health check endpoint
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
