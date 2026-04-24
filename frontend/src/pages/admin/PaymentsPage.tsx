/**
 * Payments Management Page (ADMIN)
 * With toast notifications and MUI components
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetPaymentsPaginatedQuery,
  useUpdatePaymentStatusMutation,
} from '../../services/adminApi';
import { PaymentStatus } from '../../types/api';
import { downloadCsvFromApi } from '../../utils/download';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

export const PaymentsPage = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');

  const { data, isLoading, error } = useGetPaymentsPaginatedQuery({
    page,
    size,
    sort: 'createdAt',
    direction: 'DESC',
  });

  const [updatePaymentStatus, { isLoading: isUpdating }] = useUpdatePaymentStatusMutation();

  const getStatusColor = (status: PaymentStatus): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      case 'VERIFY':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleVerifyPayment = async (id: number) => {
    const toastId = toast.loading('Verifying payment...');
    try {
      await updatePaymentStatus({ id, status: PaymentStatus.PAID }).unwrap();
      toast.success('Payment verified successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to verify payment', { id: toastId });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      await downloadCsvFromApi(`${baseUrl}/payments/export`, 'payments.csv');
      toast.success('Payments exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export payments');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateMonthlyPayments = async () => {
    // Get current month in format yyyy-MM
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (!confirm(`Generate rent payments for all active tenants for ${currentMonth}?`)) {
      return;
    }
    
    setIsGenerating(true);
    const toastId = toast.loading('Generating payments...');
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      const response = await fetch(
        `${baseUrl}/payments/generate-monthly?month=${currentMonth}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to generate payments');
      }
      
      const data = await response.json();
      toast.success(`Generated ${data.generated} payments for ${currentMonth}!`, { id: toastId });
      
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Generate failed:', error);
      toast.error('Failed to generate payments', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredPayments = data?.content.filter((payment) => 
    filterStatus === 'ALL' || payment.status === filterStatus
  ) || [];

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
        <Skeleton variant="text" width="25%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>Error loading payments</Typography>
          <Typography variant="body2">Please try again later</Typography>
        </Alert>
      </Box>
    );
  }

  const pendingCount = data?.content.filter((p) => p.status === 'PENDING').length || 0;
  const verifyCount = data?.content.filter((p) => p.status === 'VERIFY').length || 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Payments
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="contained"
            color="success"
            sx={{ fontWeight: 'bold' }}
            onClick={handleGenerateMonthlyPayments}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate This Month'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ fontWeight: 'bold' }}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </Box>
      </Box>

      {/* Filter and Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Status Filter */}
        <Card>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'ALL')}
              >
                <MenuItem value="ALL">All Payments</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="VERIFY">Verify</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          <Card sx={{ bgcolor: '#fef3c7', border: '1px solid #f59e0b' }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: 'medium', color: '#b45309' }}>
                Pending
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#92400e', mt: 0.5 }}>
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: '#dbeafe', border: '1px solid #3b82f6' }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: 'medium', color: '#1e40af' }}>
                Verify
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e3a8a', mt: 0.5 }}>
                {verifyCount}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredPayments.length} of {data?.totalElements || 0} payments
          </Typography>
        </CardContent>
      </Card>

      {/* Payments Table/List */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 12, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No payments found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try changing the filter
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {/* Desktop Table */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="caption" sx={{ fontWeight: 'bold' }}>TENANT</Typography></TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontWeight: 'bold' }}>PROPERTY</Typography></TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontWeight: 'bold' }}>MONTH</Typography></TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontWeight: 'bold' }}>AMOUNT</Typography></TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontWeight: 'bold' }}>UTR</Typography></TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontWeight: 'bold' }}>STATUS</Typography></TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontWeight: 'bold' }}>ACTIONS</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {payment.tenantName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{payment.propertyName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(payment.month).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'semibold' }}>
                          ₹{payment.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {payment.utrNumber || payment.utr ? (
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              bgcolor: '#f3f4f6',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            {payment.utrNumber || payment.utr}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={getStatusColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.status === 'VERIFY' && (payment.utrNumber || payment.utr) && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleVerifyPayment(payment.id)}
                            disabled={isUpdating}
                            startIcon={<CheckCircleIcon />}
                          >
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile Cards */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {filteredPayments.map((payment, index) => (
              <Box
                key={payment.id}
                sx={{
                  p: 2,
                  borderTop: index > 0 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'semibold' }}>
                      {payment.tenantName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.propertyName}
                    </Typography>
                  </Box>
                  <Chip
                    label={payment.status}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Month
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {new Date(payment.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'semibold' }}>
                      ₹{payment.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  {(payment.utrNumber || payment.utr) && (
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Typography variant="caption" color="text.secondary">
                        UTR
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: '#f3f4f6',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          mt: 0.5,
                        }}
                      >
                        {payment.utrNumber || payment.utr}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {payment.status === 'VERIFY' && (payment.utrNumber || payment.utr) && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => handleVerifyPayment(payment.id)}
                    disabled={isUpdating}
                  >
                    Verify Payment
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Card>
      )}

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={data?.totalPages || 1}
          page={page + 1}
          onChange={(_, value) => setPage(value - 1)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
};
