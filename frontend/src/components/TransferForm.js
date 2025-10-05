import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper
} from '@mui/material';
import { Send, Security } from '@mui/icons-material';
import { ethers } from 'ethers';

const TransferForm = ({ wallet, onTransferComplete, onError }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState('ETH');
  const [loading, setLoading] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [signing, setSigning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recipient.trim()) {
      onError('Please enter a recipient address');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      onError('Please enter a valid amount');
      return;
    }

    if (recipient.toLowerCase() === wallet.address.toLowerCase()) {
      onError('Cannot send to your own address');
      return;
    }

    setLoading(true);
    onError('');

    try {
      const response = await fetch('http://localhost:5001/api/transfer/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_address: wallet.address,
          to_address: recipient,
          amount: parseFloat(amount),
          amount_type: amountType,
          email: '21pc37@psgtech.ac.in'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPendingTransfer(data);
        setApprovalDialog(true);
      } else {
        onError(data.error || 'Failed to initiate transfer');
      }
    } catch (error) {
      onError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignTransaction = async () => {
    if (!pendingTransfer) return;

    setSigning(true);
    onError('');

    try {
      // Get the mnemonic from the current wallet (this is for demo purposes only)
      // In a real app, you'd use a proper wallet connection
      if (!wallet || !wallet.mnemonic) {
        throw new Error('Wallet mnemonic not available');
      }

      // Create wallet from mnemonic (ethers v6 syntax)
      const walletInstance = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(wallet.mnemonic));
      
      // Sign the message (ethers v6 format with EIP-191 encoding)
      const signature = await walletInstance.signMessage(pendingTransfer.message);

      // Send the signed transaction
      const executeResponse = await fetch('http://localhost:5001/api/transfer/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transfer_id: pendingTransfer.transfer_id,
          signature: signature
        }),
      });

      const executeData = await executeResponse.json();

      if (executeData.success) {
        setApprovalDialog(false);
        setPendingTransfer(null);
        onTransferComplete();
        onError(''); // Clear any previous errors
        // Reset form
        setRecipient('');
        setAmount('');
      } else {
        onError(executeData.error || 'Failed to execute transfer');
      }
    } catch (error) {
      onError('Signing failed: ' + error.message);
    } finally {
      setSigning(false);
    }
  };

  const handleCancelTransfer = () => {
    setApprovalDialog(false);
    setPendingTransfer(null);
  };

  // const formatMessage = (message) => {
  //   return message.split(' ').map((word, index) => {
  //     if (word.startsWith('0x') && word.length > 20) {
  //       return (
  //         <span key={index} style={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
  //           {word}
  //         </span>
  //       );
  //     }
  //     return word + ' ';
  //   });
  // };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Send ETH
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Transfer mock ETH to another address with digital signature verification
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              variant="outlined"
              sx={{ mb: 3 }}
              helperText="Enter the Ethereum address to send to"
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                variant="outlined"
                inputProps={{ min: 0, step: 0.000001 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={amountType}
                  label="Currency"
                  onChange={(e) => setAmountType(e.target.value)}
                >
                  <MenuItem value="ETH">ETH</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {amountType === 'USD' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                USD amounts will be converted to ETH using real-time prices from Skip API
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            >
              {loading ? 'Preparing Transfer...' : 'Send Transfer'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={handleCancelTransfer} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 1, color: 'warning.main' }} />
            Approve Transaction
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please review the transaction details before signing
          </Alert>

          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Transaction Details:
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>From:</strong> {wallet.address}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>To:</strong> {pendingTransfer?.to_address}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Amount:</strong> {pendingTransfer?.amount} ETH
            </Typography>
            {pendingTransfer?.amount_usd && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>USD Value:</strong> ${pendingTransfer.amount_usd}
              </Typography>
            )}
          </Paper>

          <Typography variant="h6" gutterBottom>
            Message to Sign:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'white', border: '1px solid #ccc' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {pendingTransfer?.message}
            </Typography>
          </Paper>

          <Alert severity="info" sx={{ mt: 2 }}>
            By clicking "Sign & Send", you're digitally signing this message to authorize the transfer.
            This signature proves you own the wallet and approve this transaction.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelTransfer} disabled={signing}>
            Cancel
          </Button>
          <Button
            onClick={handleSignTransaction}
            variant="contained"
            disabled={signing}
            startIcon={signing ? <CircularProgress size={20} /> : <Security />}
          >
            {signing ? 'Signing...' : 'Sign & Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransferForm;
