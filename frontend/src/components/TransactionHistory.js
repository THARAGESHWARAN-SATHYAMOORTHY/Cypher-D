import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  History,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Schedule
} from '@mui/icons-material';

const TransactionHistory = ({ wallet }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [wallet.address]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5001/api/transactions/${wallet.address}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      } else {
        setError(data.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionIcon = (type) => {
    return type === 'sent' ? <ArrowUpward color="error" /> : <ArrowDownward color="success" />;
  };

  // const getTransactionColor = (type) => {
  //   return type === 'sent' ? 'error' : 'success';
  // };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Transaction History
        </Typography>
        <IconButton onClick={fetchTransactions} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {transactions.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <History sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No transactions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your transaction history will appear here once you start sending ETH
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>To/From</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Hash</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTransactionIcon(tx.type)}
                      <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {tx.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {tx.amount} ETH
                      </Typography>
                      {tx.amount_usd && (
                        <Typography variant="caption" color="text.secondary">
                          ${tx.amount_usd}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {tx.type === 'sent' 
                        ? formatAddress(tx.to_address)
                        : formatAddress(tx.from_address)
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={tx.status === 'completed' ? <CheckCircle /> : <Schedule />}
                      label={tx.status}
                      color={tx.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(tx.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {tx.id.toString().padStart(6, '0')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong>
          All transactions are simulated and stored locally.
        </Typography>
      </Alert>
    </Box>
  );
};

export default TransactionHistory;
