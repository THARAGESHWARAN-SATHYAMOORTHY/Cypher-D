# CypherD Wallet - Mock Web3 Wallet

A simple, functional mock web3 wallet application built with Python Flask backend and React frontend. This project demonstrates core Web3 concepts including wallet creation, digital signatures, and transaction verification.

## 🎯 Features

- **🔐 Wallet Creation & Import**: Generate new 12-word mnemonic phrases or import existing ones
- **💰 Balance Management**: View mock ETH balances with real-time display
- **📤 ETH Transfers**: Send mock ETH with digital signature verification
- **💱 USD Conversion**: Send specific USD amounts with real-time ETH conversion via Skip API
- **📊 Transaction History**: Complete transaction tracking and display
- **📧 Real Notifications**: Email notifications for successful transactions
- **🛡️ Security**: Digital signature verification and price tolerance checks

## 🎬 Demo Video

Watch the complete CypherD wallet application in action:

![Watch CypherD Wallet Demo](https://github.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/blob/main/demo-ss/Screenshot_2025-10-05_at_11.55.46%E2%80%AFAM.png)

## 📸 Demo Screenshots

Here's a complete walkthrough of the CypherD wallet application:

### 1. Welcome & Wallet Setup
![Welcome Screen](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_11.55.46%20AM.png)
*Initial welcome screen where users can create a new wallet or import an existing one.*

### 2. Create New Wallet
![Create Wallet](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_11.56.45%20AM.png)
*Wallet creation interface showing the option to generate a new 12-word mnemonic phrase.*

### 3. Mnemonic Phrase Display
![Mnemonic Phrase](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_11.58.19%20AM.png)
*Generated mnemonic phrase display with security warning and copy functionality.*

### 4. Mnemonic Confirmation
![Mnemonic Confirmation](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_11.58.26%20AM.png)
*Verification step where users must enter their mnemonic phrase to confirm wallet creation.*

### 5. Wallet List View
![Wallet List](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_11.58.41%20AM.png)
*Main wallet dashboard showing all created wallets with balances and management options.*

### 6. Wallet Dashboard
![Wallet Dashboard](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_11.58.54%20AM.png)
*Individual wallet dashboard displaying balance, address, and quick actions.*

### 7. Send ETH Interface
![Send ETH](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_11.59.02%20AM.png)
*Transfer form for sending ETH to another address with amount input and recipient details.*

### 8. Transaction Confirmation
![Transaction Confirmation](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_11.59.06%20AM.png)
*Transaction review screen showing details before digital signature approval.*

### 9. USD Transfer Option
![USD Transfer](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_12.01.26%20PM.png)
*Send USD amount interface with real-time ETH conversion using external price API.*

### 10. USD Transfer Confirmation
![USD Transfer Confirmation](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_12.01.38%20PM.png)
*USD transfer review showing converted ETH amount and exchange rate.*

### 11. Transaction Success
![Transaction Success](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_12.01.42%20PM.png)
*Success notification after completed transaction with email confirmation details.*

### 12. Transaction History
![Transaction History](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_12.01.55%20PM.png)
*Complete transaction history showing all past transfers with timestamps and status.*

### 13. Wallet Management
![Wallet Management](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_12.02.06%20PM.png)
*Wallet management interface with options to edit names, delete wallets, and view details.*

### 14. Import Existing Wallet
![Import Wallet](https://raw.githubusercontent.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D/main/demo-ss/Screenshot_2025-10-05_at_12.02.26%20PM.png)
*Import existing wallet interface where users can enter their 12-word mnemonic phrase.*

## 🏗️ Architecture

- **Backend**: Python Flask API with SQLite database
- **Frontend**: React web application with Material-UI
- **Crypto**: Ethereum wallet generation using `mnemonic` and `eth-account`
- **External APIs**: Skip API for USD/ETH price conversion
- **Notifications**: Email via SMTP
- **Database**: SQLite with SQLAlchemy ORM

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Automated Setup (Recommended)

```bash
# Clone and setup everything automatically
git clone https://github.com/THARAGESHWARAN-SATHYAMOORTHY/Cypher-D.git
cd Cypher-D
./setup.sh
```

### Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  
# On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Create environment file
cp env.example .env
# Edit .env with your email credentials

# Start server
python run.py
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Variables

Edit `backend/.env` file:

```env
FLASK_ENV=development
DATABASE_URL=sqlite:///wallet.db
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

> **Note**: For Gmail, you need to use an App Password instead of your regular password.

## 📱 Usage Guide

### 1. Create or Import Wallet
- **Create New**: Generate a unique 12-word mnemonic phrase
- **Import Existing**: Enter your existing mnemonic phrase
- **Save Securely**: Copy and store your mnemonic phrase safely

### 2. View Your Balance
- See your mock ETH balance on the dashboard
- Balance is randomly generated (1-10 ETH) for new wallets
- Refresh to update balance after transactions

### 3. Send ETH
- Enter recipient's Ethereum address
- Choose amount in ETH or USD
- For USD: Real-time conversion using Skip API
- Review and approve the transaction

### 4. Transaction Approval
- Review transaction details
- Sign the message using your wallet's private key
- Digital signature proves you own the wallet
- Transaction is verified and executed

### 5. View History
- See all your past transactions
- Filter by sent/received
- View transaction details and status

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/wallet/create` | Create new wallet with mnemonic |
| `POST` | `/api/wallet/import` | Import existing wallet |
| `GET` | `/api/wallet/balance/:address` | Get wallet balance |
| `POST` | `/api/transfer/initiate` | Initiate transfer (returns message to sign) |
| `POST` | `/api/transfer/execute` | Execute signed transfer |
| `GET` | `/api/transactions/:address` | Get transaction history |
| `GET` | `/api/health` | Health check endpoint |

## 🔒 Security Features

- **Digital Signature Verification**: All transactions require valid signatures
- **Time-Limited Approvals**: Approval messages expire after 30 seconds
- **Price Tolerance Checks**: USD transfers check for price swings (>1%)
- **Secure Mnemonic Handling**: Mnemonics stored locally in browser
- **Address Validation**: Proper Ethereum address format checking

## 🛠️ Tech Stack

### Backend
- **Python 3.8+**: Core language
- **Flask**: Web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Database
- **eth-account**: Ethereum wallet operations
- **mnemonic**: BIP39 mnemonic generation
- **requests**: HTTP client for external APIs

### Frontend
- **React 18**: UI framework
- **Material-UI**: Component library
- **ethers.js**: Ethereum utilities
- **Axios**: HTTP client (via fetch)

### External Services
- **Skip API**: USD/ETH price conversion
- **SMTP**: Email notifications

## 📁 Project Structure

```
Cypher-D/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── run.py             # Development server runner
│   ├── init_db.py         # Database initialization
│   ├── test_api.py        # API testing script
│   ├── env.example        # Environment variables template
│   ├── wallet.db          # SQLite database (created on first run)
│   └── venv/              # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── TransactionHistory.js  # Transaction log component
│   │   │   ├── TransferForm.js       # ETH transfer interface
│   │   │   ├── WalletDashboard.js    # Balance and info display
│   │   │   ├── WalletList.js         # Wallet management
│   │   │   └── WalletSetup.js        # Wallet creation/import
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Main app styles
│   │   ├── App.test.js    # App tests
│   │   ├── index.js       # Entry point
│   │   ├── index.css      # Global styles
│   │   ├── logo.svg       # App logo
│   │   ├── reportWebVitals.js  # Performance monitoring
│   │   └── setupTests.js  # Test setup
│   ├── public/            # Static files
│   │   ├── index.html     # HTML template
│   │   ├── favicon.ico    # Site icon
│   │   ├── logo192.png    # App logos
│   │   ├── logo512.png
│   │   ├── manifest.json  # PWA manifest
│   │   └── robots.txt     # SEO robots file
│   ├── package.json       # Node.js dependencies
│   ├── package-lock.json  # Dependency lock file
│   └── node_modules/      # Node.js dependencies (auto-generated)
├── setup.sh               # Automated setup script
├── quick_start.sh         # Quick launch script
├── simple_test.py         # Simple API tests
├── test_complete_flow.py  # Complete flow tests
├── view_db.py            # Database viewer utility
└── README.md             # This file
```

## 🎓 Learning Objectives

This project demonstrates:

1. **Wallet Generation**: Creating Ethereum wallets from mnemonic phrases
2. **Digital Signatures**: Signing and verifying transaction messages
3. **Blockchain Concepts**: Addresses, transactions, and verification
4. **API Integration**: Real-time price conversion and external services
5. **Security**: Proper signature verification and transaction validation
6. **Full-Stack Development**: Backend API and frontend integration

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**: Check Python version and dependencies
2. **Frontend build fails**: Ensure Node.js 16+ is installed
3. **Database errors**: Run `python init_db.py` to recreate tables
4. **Email not sending**: Verify SMTP credentials in `.env` file
5. **API connection errors**: Ensure backend is running on port 5000

### Development Tips

- Use browser developer tools to inspect network requests
- Check backend logs for detailed error messages
- Verify database tables exist in `wallet.db`
- Test API endpoints directly using curl or Postman

