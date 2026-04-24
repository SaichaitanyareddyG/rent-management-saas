/**
 * Login Page
 * Mobile-first responsive login form with Material-UI
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
import { useLoginMutation } from '../services/authApi';
import type { LoginRequest } from '../types/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(formData).unwrap();
      toast.success(`✅ Welcome back, ${result.email}!`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
            Property Management System
          </Typography>
        </Box>

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
            autoFocus
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
            autoComplete="current-password"
            sx={{ mb: 1 }}
          />

          {/* Forgot Password Link */}
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {'data' in error 
                ? (error.data as any)?.message || 'Login failed'
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        {/* Demo Credentials */}
        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Demo: john@example.com / pass123
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link 
              component={RouterLink} 
              to="/register" 
              sx={{ 
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Create Account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
