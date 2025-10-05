import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import {
  AccountBalance,
  ContentCopy,
  Refresh,
  CheckCircle
} from '@mui/icons-material';

const WalletDashboard = ({ wallet, onRefresh }) => {
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(wallet.balance);

  useEffect(() => {
    setBalance(wallet.balance);
  }, [wallet.balance]);

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Wallet Dashboard
      </Typography>

      {/* Balance Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountBalance sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h6">
              Your Balance
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            {balance.toFixed(6)} ETH
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Mock ETH Balance
          </Typography>
        </CardContent>
      </Card>

      {/* Wallet Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Wallet Information
          </Typography>
          
          <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Wallet Address
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {wallet.address}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={copyAddress}
                startIcon={copied ? <CheckCircle /> : <ContentCopy />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip 
              label="Mock Wallet" 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label="Ethereum Network" 
              color="secondary" 
              variant="outlined"
            />
            <Chip 
              label="Test Environment" 
              color="warning" 
              variant="outlined"
            />
          </Box>

          <Button
            variant="outlined"
            onClick={onRefresh}
            startIcon={<Refresh />}
            fullWidth
          >
            Refresh Balance
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">
              Wallet Status
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Active
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ready for transactions
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" color="success.main">
              Network
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Mock-Z
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Test environment
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note: </strong> 
          All transactions are processed locally for demonstration.
        </Typography>
      </Alert>
    </Box>
  );
};

export default WalletDashboard;
