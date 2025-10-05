import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  TextField
} from '@mui/material';
import {
  Add,
  AccountBalance,
  Delete,
  Launch,
  ContentCopy,
  CheckCircle,
  Edit
} from '@mui/icons-material';

const WalletList = ({ onSelectWallet, onCreateWallet, onDeleteWallet }) => {
  const [wallets, setWallets] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, wallet: null });
  const [editDialog, setEditDialog] = useState({ open: false, wallet: null, newName: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    const savedWallets = localStorage.getItem('cypherd_wallets');
    if (savedWallets) {
      try {
        const walletsData = JSON.parse(savedWallets);
        // Ensure each wallet has a name, set default if missing
        const walletsWithNames = walletsData.map((wallet, index) => ({
          ...wallet,
          name: wallet.name || `Wallet ${index + 1}`
        }));
        setWallets(walletsWithNames);
      } catch (e) {
        console.error('Error loading wallets:', e);
        localStorage.removeItem('cypherd_wallets');
      }
    }
  };

  const handleDeleteWallet = (wallet) => {
    setDeleteDialog({ open: true, wallet });
  };

  const confirmDelete = () => {
    if (deleteDialog.wallet) {
      const updatedWallets = wallets.filter(w => w.address !== deleteDialog.wallet.address);
      setWallets(updatedWallets);
      localStorage.setItem('cypherd_wallets', JSON.stringify(updatedWallets));
      onDeleteWallet(deleteDialog.wallet);
      setDeleteDialog({ open: false, wallet: null });
    }
  };

  const handleEditWallet = (wallet) => {
    setEditDialog({ open: true, wallet, newName: wallet.name || '' });
  };

  const confirmEdit = () => {
    if (editDialog.wallet && editDialog.newName.trim()) {
      const updatedWallets = wallets.map(w => 
        w.address === editDialog.wallet.address 
          ? { ...w, name: editDialog.newName.trim() }
          : w
      );
      setWallets(updatedWallets);
      localStorage.setItem('cypherd_wallets', JSON.stringify(updatedWallets));
      setEditDialog({ open: false, wallet: null, newName: '' });
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(6);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Your Wallets
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
        Manage your CypherD wallets and access your funds
      </Typography>

      {wallets.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Wallets Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first wallet to get started with CypherD
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={onCreateWallet}
            >
              Create Your First Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {wallets.length} Wallet{wallets.length !== 1 ? 's' : ''} Found
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onCreateWallet}
            >
              Add New Wallet
            </Button>
          </Box>

          <Grid container spacing={3}>
            {wallets.map((wallet, index) => (
              <Grid item xs={12} sm={6} md={4} key={wallet.address}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {wallet.name || `Wallet ${index + 1}`}
                        </Typography>
                        <Chip 
                          label="Mock Wallet" 
                          color="primary" 
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditWallet(wallet)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteWallet(wallet)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>

                    <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Address
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                          {formatAddress(wallet.address)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyAddress(wallet.address)}
                        >
                          {copied ? <CheckCircle color="success" /> : <ContentCopy />}
                        </IconButton>
                      </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Balance
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatBalance(wallet.balance)} ETH
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Launch />}
                      onClick={() => onSelectWallet(wallet)}
                    >
                      Open Wallet
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, wallet: null })}
      >
        <DialogTitle>Delete Wallet</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. Make sure you have saved your mnemonic phrase.
          </Alert>
          <Typography>
            Are you sure you want to delete wallet {formatAddress(deleteDialog.wallet?.address || '')}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, wallet: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Wallet Name Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, wallet: null, newName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Wallet Name</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Wallet Address: {formatAddress(editDialog.wallet?.address || '')}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Wallet Name"
            fullWidth
            variant="outlined"
            value={editDialog.newName}
            onChange={(e) => setEditDialog({ ...editDialog, newName: e.target.value })}
            placeholder="Enter a custom name for your wallet"
            inputProps={{ maxLength: 50 }}
            helperText={`${editDialog.newName.length}/50 characters`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, wallet: null, newName: '' })}>
            Cancel
          </Button>
          <Button 
            onClick={confirmEdit} 
            variant="contained"
            disabled={!editDialog.newName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletList;
