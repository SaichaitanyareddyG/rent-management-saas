/**
 * Forgot Password Page
 * Request password reset via email
 */

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Email as EmailIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../services/authApi';
import type { ForgotPasswordRequest } from '../types/api';

export const ForgotPasswordPage = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await forgotPassword({ email } as ForgotPasswordRequest).unwrap();
      setResetToken(result.resetToken);
      setSubmitted(true);
      toast.success('Password reset instructions sent!');
    } catch (err) {
      console.error('Forgot password failed:', err);
      toast.error('Failed to process request. Please try again.');
    }
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
          maxWidth: 480,
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
        }}
      >
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
            Back to Login
          </Link>
        </Box>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <EmailIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem' },
            }}
          >
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No worries, we'll send you reset instructions
          </Typography>
        </Box>

        {!submitted ? (
          <Box component="form" onSubmit={handleSubmit}>
            {/* Email Input */}
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              margin="normal"
              autoComplete="email"
              autoFocus
              sx={{ mb: 3 }}
            />

            {/* Submit Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                If an account exists with <strong>{email}</strong>, you will receive a password reset link.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Check your email inbox and follow the instructions to reset your password.
              </Typography>
            </Alert>

            {/* Development Only: Display Reset Token */}
            {resetToken && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  🔧 Development Mode
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 1 }}>
                  Use this link to reset your password:
                </Typography>
                <Link
                  component={RouterLink}
                  to={`/reset-password?token=${resetToken}`}
                  sx={{
                    display: 'block',
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                  }}
                >
                  {window.location.origin}/reset-password?token={resetToken}
                </Link>
              </Alert>
            )}

            <Button
              fullWidth
              variant="outlined"
              onClick={() => setSubmitted(false)}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Try Another Email
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
