/**
 * Tenant Payment Page (PUBLIC)
 * No login required - access via link: /pay/:tenantId
 * MUI components only
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetTenantForPaymentQuery,
  useConfirmPaymentMutation,
} from '../../services/publicApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

export const TenantPaymentPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  
  const { data: tenant, isLoading, error } = useGetTenantForPaymentQuery(Number(tenantId));
  const [confirmPayment, { isLoading: isConfirming }] = useConfirmPaymentMutation();

  const [step, setStep] = useState<'details' | 'utr'>('details');
  const [utr, setUtr] = useState('');
  const [notes, setNotes] = useState('');

  const generateUpiLink = () => {
    if (!tenant) return '';
    
    const description = encodeURIComponent(`Rent-${tenant.currentMonth}-${tenant.roomNumber}`);
    const payeeName = encodeURIComponent(tenant.ownerName || 'Property Owner');
    
    return `upi://pay?pa=${tenant.upiId}&pn=${payeeName}&am=${tenant.rentAmount}&tn=${description}&cu=INR`;
  };

  const handlePayViaUpi = () => {
    const upiLink = generateUpiLink();
    
    // Open UPI deep link - triggers app chooser on mobile
    window.open(upiLink, '_self');
    
    // Show UTR form after brief delay
    setTimeout(() => {
      setStep('utr');
    }, 1500);
  };

  const handleCopyUpiId = () => {
    if (tenant?.upiId) {
      navigator.clipboard.writeText(tenant.upiId);
      toast.success('UPI ID copied to clipboard!');
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !utr.trim()) return;

    const toastId = toast.loading('Submitting payment...');
    try {
      await confirmPayment({
        tenantId: tenant.tenantId,
        month: tenant.currentMonth,
        utr: utr.trim(),
        notes: notes || 'Paid via UPI',
      }).unwrap();

      toast.success('Payment submitted successfully!', { id: toastId });
      navigate('/payment-success');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Payment confirmation failed', { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#f9fafb',
          p: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading payment details...
        </Typography>
      </Box>
    );
  }

  if (error || !tenant) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#f9fafb',
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>
              Invalid Payment Link
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This payment link is not valid or has expired.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Show already paid message
  if (tenant?.alreadyPaidThisMonth) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f9fafb', p: 2 }}>
        <Card sx={{ maxWidth: 500, borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Already Paid
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You have already paid rent for {tenant.currentMonth}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Status: <strong>{tenant.paymentStatus}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', p: { xs: 2, sm: 4 }, py: { xs: 4, sm: 8 } }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {step === 'details' && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Header */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Payment Details
                </Typography>
              </Box>

              {/* Tenant Details */}
              <Box sx={{ my: 3 }}>
                <List disablePadding>
                  <ListItem sx={{ px: 0, borderBottom: '1px solid #f3f4f6' }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Tenant Name</Typography>}
                      secondary={<Typography variant="body1" sx={{ fontWeight: 'medium' }}>{tenant.name}</Typography>}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, borderBottom: '1px solid #f3f4f6' }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Property</Typography>}
                      secondary={<Typography variant="body1" sx={{ fontWeight: 'medium' }}>{tenant.propertyName}</Typography>}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, borderBottom: '1px solid #f3f4f6' }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Room</Typography>}
                      secondary={<Typography variant="body1" sx={{ fontWeight: 'medium' }}>{tenant.roomNumber}</Typography>}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, borderBottom: '1px solid #f3f4f6' }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Month</Typography>}
                      secondary={
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {tenant.currentMonth}
                        </Typography>
                      }
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Amount Box */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  my: 3,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Rent Amount
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                  ₹{tenant.rentAmount.toLocaleString()}
                </Typography>
              </Box>

              {/* UPI ID Display Box - For Manual Entry */}
              <Box
                sx={{
                  bgcolor: '#f0fdf4',
                  border: '2px dashed #10b981',
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#059669', mb: 1 }}>
                  💳 Owner's UPI ID
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'white',
                    borderRadius: 1,
                    p: 2,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#1f2937',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                    }}
                  >
                    {tenant.upiId}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Use this UPI ID to pay manually from any UPI app (GPay, PhonePe, Paytm, etc.)
                </Typography>
              </Box>

              {/* Instructions */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  📱 Two Ways to Pay
                </Typography>
                <Box component="div" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Option 1: Quick Pay (Mobile Only)</Typography>
                  <Box component="ol" sx={{ pl: 2, m: 0, '& li': { mb: 0.5, fontSize: '0.875rem' } }}>
                    <li>Click "Pay via UPI" button below</li>
                    <li>Choose your UPI app from popup (GPay, PhonePe, Paytm, etc.)</li>
                    <li>Complete payment with pre-filled details</li>
                    <li>Return here and enter UTR number</li>
                  </Box>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Option 2: Manual Payment</Typography>
                  <Box component="ol" sx={{ pl: 2, m: 0, '& li': { mb: 0.5, fontSize: '0.875rem' } }}>
                    <li>Open any UPI app on your phone</li>
                    <li>Enter the UPI ID shown above</li>
                    <li>Enter amount: ₹{tenant.rentAmount.toLocaleString()}</li>
                    <li>Complete payment and enter UTR here</li>
                  </Box>
                </Box>
              </Alert>

              {/* Pay Button */}
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={handlePayViaUpi}
                startIcon={<PaymentIcon />}
                sx={{
                  py: 2,
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                Pay ₹{tenant.rentAmount.toLocaleString()} via UPI
              </Button>

              {/* Manual Entry Option */}
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => setStep('utr')}
                sx={{ py: 1.5 }}
              >
                Already Paid? Enter UTR
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'utr' && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                Enter Payment Details
              </Typography>

              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Payment Initiated
                </Typography>
                <Typography variant="body2">
                  Please complete payment using any UPI app and enter the transaction reference below.
                </Typography>
              </Alert>

              {/* Owner UPI ID with Copy Button */}
              <Box
                sx={{
                  bgcolor: '#f0fdf4',
                  border: '2px solid #10b981',
                  borderRadius: 2,
                  p: 2.5,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#059669', mb: 1.5 }}>
                  💳 Owner's UPI ID
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      flex: 1,
                      fontWeight: 'bold',
                      color: '#1f2937',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      userSelect: 'all',
                    }}
                  >
                    {tenant.upiId}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCopyUpiId}
                    startIcon={<CopyIcon />}
                    sx={{
                      minWidth: 'auto',
                      whiteSpace: 'nowrap',
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: '#f9fafb',
                      },
                    }}
                  >
                    Copy
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Use this UPI ID if paying manually from your UPI app
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleConfirmPayment} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="UPI Transaction Reference (UTR)"
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g., 1234567890"
                  helperText="Find this in your UPI app's transaction history"
                  fullWidth
                />

                <TextField
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  multiline
                  rows={3}
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isConfirming || !utr.trim()}
                  sx={{
                    py: 2,
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                  }}
                >
                  {isConfirming ? 'Submitting...' : 'Submit Payment Confirmation'}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setStep('details')}
                  startIcon={<ArrowBackIcon />}
                  sx={{ py: 1.5 }}
                >
                  Back to Payment Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};
