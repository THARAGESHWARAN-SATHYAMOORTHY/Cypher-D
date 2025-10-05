import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Wallet, FileDownload } from '@mui/icons-material';

const WalletSetup = ({ onWalletCreated, onWalletImported, onError, loading, setLoading }) => {
  const [mode, setMode] = useState('create'); // 'create' or 'import'
  const [mnemonic, setMnemonic] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleCreateWallet = async () => {
    setLoading(true);
    onError('');
    
    try {
      const response = await fetch('http://localhost:5001/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedMnemonic(data.mnemonic);
        setShowMnemonic(true);
        onWalletCreated(data);
      } else {
        onError(data.error || 'Failed to create wallet');
      }
    } catch (error) {
      onError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!mnemonic.trim()) {
      onError('Please enter a mnemonic phrase');
      return;
    }

    setLoading(true);
    onError('');
    
    try {
      const response = await fetch('http://localhost:5001/api/wallet/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mnemonic: mnemonic.trim() }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onWalletImported(data);
      } else {
        onError(data.error || 'Failed to import wallet');
      }
    } catch (error) {
      onError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyMnemonic = () => {
    navigator.clipboard.writeText(generatedMnemonic);
  };

  if (showMnemonic) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🎉 Wallet Created Successfully!
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Important:</strong> Save your mnemonic phrase in a safe place. 
            Anyone with this phrase can access your wallet!
          </Alert>
          
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Your 12-word mnemonic phrase:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'monospace', 
                wordBreak: 'break-all',
                bgcolor: 'white',
                p: 2,
                borderRadius: 1,
                border: '1px solid #ccc'
              }}
            >
              {generatedMnemonic}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={copyMnemonic}
              sx={{ mt: 1 }}
            >
              Copy to Clipboard
            </Button>
          </Paper>
          
          <Button 
            variant="contained" 
            onClick={() => setShowMnemonic(false)}
            sx={{ mt: 2 }}
          >
            Continue to Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Welcome to CypherD Wallet
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
        A mock Web3 wallet for learning blockchain concepts
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant={mode === 'create' ? 'contained' : 'outlined'}
          onClick={() => setMode('create')}
          startIcon={<Wallet />}
          sx={{ flex: 1 }}
        >
          Create New Wallet
        </Button>
        <Button
          variant={mode === 'import' ? 'contained' : 'outlined'}
          onClick={() => setMode('import')}
          startIcon={<FileDownload />}
          sx={{ flex: 1 }}
        >
          Import Existing Wallet
        </Button>
      </Box>

      {mode === 'create' ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create New Wallet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate a new 12-word mnemonic phrase and create a unique wallet address.
              You'll start with a random amount of mock ETH (1-10 ETH).
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleCreateWallet}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating Wallet...
                </>
              ) : (
                'Create New Wallet'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Import Existing Wallet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your 12-word mnemonic phrase to import an existing wallet.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your 12-word mnemonic phrase here..."
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            <Button
              variant="contained"
              onClick={handleImportWallet}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Importing Wallet...
                </>
              ) : (
                'Import Wallet'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WalletSetup;
