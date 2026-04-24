/**
 * Profile Completion Modal
 * For Google OAuth users who need to provide phone number
 */

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Phone } from '@mui/icons-material';

interface ProfileCompletionModalProps {
  open: boolean;
  onComplete: (phone: string) => void;
  userName: string;
}

export function ProfileCompletionModal({ open, onComplete, userName }: ProfileCompletionModalProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Basic validation
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    
    if (phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }

    onComplete(phone);
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Phone color="primary" />
          <Typography variant="h6">Complete Your Profile</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Welcome, {userName}! Please provide your phone number to complete your profile.
        </Typography>
        
        <TextField
          autoFocus
          fullWidth
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error}
          placeholder="e.g., 9876543210"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          size="large"
          fullWidth
        >
          Complete Profile
        </Button>
      </DialogActions>
    </Dialog>
  );
}
