import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Alert,
  Button
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import WalletSetup from './components/WalletSetup';
import WalletDashboard from './components/WalletDashboard';
import WalletList from './components/WalletList';
import TransferForm from './components/TransferForm';
import TransactionHistory from './components/TransactionHistory';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'setup', 'wallet'

  useEffect(() => {
    // Check if there are any wallets in localStorage
    const savedWallets = localStorage.getItem('cypherd_wallets');
    if (savedWallets) {
      try {
        const walletsData = JSON.parse(savedWallets);
        if (walletsData.length > 0) {
          // If there are wallets, start with home view
          setCurrentView('home');
        } else {
          // If no wallets, start with setup
          setCurrentView('setup');
        }
      } catch (e) {
        localStorage.removeItem('cypherd_wallets');
        setCurrentView('setup');
      }
    } else {
      // No wallets found, start with setup
      setCurrentView('setup');
    }
  }, []);

  const handleWalletCreated = (walletData) => {
    // Add to wallets list
    const savedWallets = localStorage.getItem('cypherd_wallets');
    let wallets = [];
    if (savedWallets) {
      try {
        wallets = JSON.parse(savedWallets);
      } catch (e) {
        wallets = [];
      }
    }
    
    // Add default name if not present
    const walletWithName = {
      ...walletData,
      name: walletData.name || `Wallet ${wallets.length + 1}`
    };
    
    // Check if wallet already exists
    const existingIndex = wallets.findIndex(w => w.address === walletData.address);
    if (existingIndex >= 0) {
      wallets[existingIndex] = walletWithName;
    } else {
      wallets.push(walletWithName);
    }
    
    localStorage.setItem('cypherd_wallets', JSON.stringify(wallets));
    setError('');
    setCurrentView('home'); // Navigate back to home after creation
  };

  const handleWalletImported = (walletData) => {
    // Add to wallets list
    const savedWallets = localStorage.getItem('cypherd_wallets');
    let wallets = [];
    if (savedWallets) {
      try {
        wallets = JSON.parse(savedWallets);
      } catch (e) {
        wallets = [];
      }
    }
    
    // Add default name if not present
    const walletWithName = {
      ...walletData,
      name: walletData.name || `Wallet ${wallets.length + 1}`
    };
    
    // Check if wallet already exists
    const existingIndex = wallets.findIndex(w => w.address === walletData.address);
    if (existingIndex >= 0) {
      wallets[existingIndex] = walletWithName;
    } else {
      wallets.push(walletWithName);
    }
    
    localStorage.setItem('cypherd_wallets', JSON.stringify(wallets));
    setError('');
    setCurrentView('home'); // Navigate back to home after import
  };

  const handleTransferComplete = () => {
    // Refresh wallet balance
    if (wallet) {
      fetchBalance();
    }
  };

  const fetchBalance = async () => {
    if (!wallet) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/wallet/balance/${wallet.address}`);
      const data = await response.json();
      
      if (data.success) {
        const updatedWallet = { ...wallet, balance: data.balance };
        setWallet(updatedWallet);
        
        // Update in wallets list
        const savedWallets = localStorage.getItem('cypherd_wallets');
        if (savedWallets) {
          try {
            const wallets = JSON.parse(savedWallets);
            const walletIndex = wallets.findIndex(w => w.address === wallet.address);
            if (walletIndex >= 0) {
              wallets[walletIndex] = updatedWallet;
              localStorage.setItem('cypherd_wallets', JSON.stringify(wallets));
            }
          } catch (e) {
            console.error('Error updating wallet in list:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleSelectWallet = (selectedWallet) => {
    // Ensure the wallet has the mnemonic for signing transactions
    const savedWallets = localStorage.getItem('cypherd_wallets');
    if (savedWallets) {
      try {
        const wallets = JSON.parse(savedWallets);
        const fullWallet = wallets.find(w => w.address === selectedWallet.address);
        if (fullWallet && fullWallet.mnemonic) {
          setWallet(fullWallet);
        } else {
          setWallet(selectedWallet);
        }
      } catch (e) {
        setWallet(selectedWallet);
      }
    } else {
      setWallet(selectedWallet);
    }
    setCurrentView('wallet');
  };

  const handleCreateWallet = () => {
    setCurrentView('setup');
  };

  const handleDeleteWallet = (deletedWallet) => {
    // If the deleted wallet is currently active, clear it
    if (wallet && wallet.address === deletedWallet.address) {
      setWallet(null);
      setCurrentView('home');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  // Render different views based on currentView state
  if (currentView === 'setup') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                CypherD Wallet
              </Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md" sx={{ mt: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <WalletSetup
              onWalletCreated={handleWalletCreated}
              onWalletImported={handleWalletImported}
              onError={setError}
              loading={loading}
              setLoading={setLoading}
            />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (currentView === 'home') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                CypherD Wallet
              </Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <WalletList
              onSelectWallet={handleSelectWallet}
              onCreateWallet={handleCreateWallet}
              onDeleteWallet={handleDeleteWallet}
            />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CypherD Wallet
            </Typography>
            <Button 
              color="inherit" 
              onClick={handleBackToHome}
              sx={{ mr: 2 }}
            >
              Back to Home
            </Button>
            <Typography variant="body2">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="md" sx={{ mt: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Dashboard" />
              <Tab label="Send ETH" />
              <Tab label="History" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <WalletDashboard wallet={wallet} onRefresh={fetchBalance} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <TransferForm
              wallet={wallet}
              onTransferComplete={handleTransferComplete}
              onError={setError}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <TransactionHistory wallet={wallet} />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;