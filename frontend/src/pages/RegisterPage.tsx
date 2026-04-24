/**
 * Register Page
 * User registration form with Material-UI
 */

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  CircularProgress,
  Alert,
  Link
} from '@mui/material';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '../services/authApi';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      }).unwrap();
      
      toast.success('🎉 Registration successful! Please login with your credentials.');
      
      navigate('/login', { 
        state: { message: 'Registration successful! Please login.' } 
      });
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setValidationError('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'grey.50',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
        }}
      >
        {/* Logo/Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}
          >
            RentApp
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your account
          </Typography>
        </Box>

        {/* Register Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Name Input */}
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Full Name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            disabled={isLoading}
            margin="normal"
            autoComplete="name"
            autoFocus
            sx={{ mb: 2 }}
          />

          {/* Email Input */}
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading}
            margin="normal"
            autoComplete="email"
            sx={{ mb: 2 }}
          />

          {/* Phone Input */}
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone Number"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            disabled={isLoading}
            margin="normal"
            autoComplete="tel"
            sx={{ mb: 2 }}
          />

          {/* Password Input */}
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isLoading}
            margin="normal"
            autoComplete="new-password"
            helperText="At least 6 characters"
            sx={{ mb: 2 }}
          />

          {/* Confirm Password Input */}
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            disabled={isLoading}
            margin="normal"
            autoComplete="new-password"
            sx={{ mb: 2 }}
          />

          {/* Validation Error */}
          {validationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          )}

          {/* API Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {'data' in error 
                ? (error.data as any)?.message || 'Registration failed'
                : 'An error occurred'}
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ 
              mt: 2, 
              mb: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
              }
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </Box>

        {/* Login Link */}
        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link 
              component={RouterLink} 
              to="/login" 
              sx={{ 
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
