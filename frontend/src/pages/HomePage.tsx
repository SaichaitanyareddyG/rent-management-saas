/**
 * Public Home/Landing Page
 * Beautiful rental property management homepage with tenant payment portal
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Room as RoomIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';

interface TenantDetails {
  tenantId: number;
  name: string;
  roomNumber: string;
  propertyName: string;
  rentAmount: number;
  currentMonth: string;
  upiId: string;
  alreadyPaidThisMonth: boolean;
  paymentStatus: string;
}

export const HomePage = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantDetails, setTenantDetails] = useState<TenantDetails | null>(null);
  const [verified, setVerified] = useState(false);

  const handleFetchTenant = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    
    // Basic phone validation (10 digits)
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/public/tenant/phone/${cleanPhone}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No tenant found with this mobile number. Please check and try again.');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch tenant details');
        }
        setTenantDetails(null);
        return;
      }
      
      const data = await response.json();
      setTenantDetails(data);
      setVerified(false); // Reset verification
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError('Unable to connect to server. Please try again later.');
      setTenantDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = () => {
    if (!verified) {
      setError('Please verify your details before proceeding');
      return;
    }
    if (tenantDetails) {
      navigate(`/pay/${tenantDetails.tenantId}`);
    }
  };

  const handleReset = () => {
    setPhoneNumber('');
    setTenantDetails(null);
    setVerified(false);
    setError('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Navigation Bar */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
          py: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6366f1', display: 'flex', alignItems: 'center', gap: 1 }}>
              🏠 RentApp
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ fontWeight: 'bold', textTransform: 'none' }}
              >
                Owner Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ fontWeight: 'bold', textTransform: 'none' }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section with Pay Your Rent */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 50%, #ec4899 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            display: { xs: 'none', md: 'block' },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            display: { xs: 'none', md: 'block' },
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2,
                }}
              >
                Manage Your Rentals Effortlessly
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Modern property management platform for landlords and tenants. Track payments, manage properties, and streamline rent collection.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: '#6366f1',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#f3f4f6',
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Grid>

            {/* Pay Your Rent Card */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <PaymentIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
                      💳 Pay Your Rent
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quick, secure, and hassle-free rent payment
                    </Typography>
                  </Box>

                  {!tenantDetails ? (
                    <>
                      {/* Phone Number Input */}
                      <Box sx={{ mb: 3 }}>
                        <TextField
                          fullWidth
                          label="Enter Your Mobile Number"
                          placeholder="e.g., 9876543210"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setError('');
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleFetchTenant();
                            }
                          }}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '1.1rem',
                            },
                          }}
                        />
                        {error && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                          </Alert>
                        )}
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                        onClick={handleFetchTenant}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                          fontWeight: 'bold',
                          py: 2,
                          fontSize: '1.1rem',
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                          },
                        }}
                      >
                        {loading ? 'Finding your account...' : 'Find My Account'}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Tenant Details Display */}
                      <Box sx={{ mb: 3 }}>
                        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
                          Account found! Please verify your details below.
                        </Alert>

                        <Box sx={{ bgcolor: '#f9fafb', borderRadius: 2, p: 3, mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <PersonIcon sx={{ color: '#6366f1' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Tenant Name
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {tenantDetails.name}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <HomeIcon sx={{ color: '#10b981' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Property
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {tenantDetails.propertyName}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <RoomIcon sx={{ color: '#f59e0b' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Room Number
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {tenantDetails.roomNumber}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <BankIcon sx={{ color: '#ec4899' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Monthly Rent
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                                ₹{tenantDetails.rentAmount.toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Verification Checkbox */}
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={verified}
                              onChange={(e) => {
                                setVerified(e.target.checked);
                                setError('');
                              }}
                              sx={{
                                color: '#6366f1',
                                '&.Mui-checked': {
                                  color: '#6366f1',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              I confirm these details are <strong>correct</strong>
                            </Typography>
                          }
                        />
                        
                        {error && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                          </Alert>
                        )}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={handleReset}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            fontWeight: 'bold',
                            textTransform: 'none',
                          }}
                        >
                          Change Number
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handlePayRent}
                          disabled={!verified}
                          sx={{
                            flex: 2,
                            background: verified 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : '#e5e7eb',
                            fontWeight: 'bold',
                            py: 1.5,
                            fontSize: '1.05rem',
                            textTransform: 'none',
                            color: verified ? 'white' : '#9ca3af',
                            boxShadow: verified ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                            '&:hover': {
                              background: verified 
                                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                : '#e5e7eb',
                              boxShadow: verified ? '0 6px 16px rgba(16, 185, 129, 0.4)' : 'none',
                            },
                          }}
                        >
                          Proceed to Pay
                        </Button>
                      </Box>
                    </>
                  )}

                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                      <strong>No login required</strong> - Pay instantly with UPI
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
            Why Choose RentApp?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Modern rental management platform designed for property owners and tenants
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Feature 1 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <SpeedIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Lightning Fast
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instant UPI payments without any login. Get confirmation in seconds.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 2 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 32, color: '#10b981' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  100% Secure
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bank-grade security. Your payment information is always protected.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 3 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Mobile Friendly
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pay on the go with any device. Optimized for mobile experience.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: '#1f2937',
          color: 'white',
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
            Ready to Modernize Your Rental Business?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Join hundreds of property owners managing their rentals efficiently
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
              fontWeight: 'bold',
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 24px rgba(99, 102, 241, 0.4)',
              },
            }}
          >
            Start Free Trial
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#111827', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.7 }}>
            © 2026 RentApp. All rights reserved. Made with ❤️ for property owners and tenants.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
