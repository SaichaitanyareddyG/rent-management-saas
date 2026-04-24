/**
 * Google Sign-In Button
 * OAuth 2.0 login with Google
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Box, Typography } from '@mui/material';
import { useGoogleLoginMutation } from '../services/authApi';
import { ProfileCompletionModal } from './ProfileCompletionModal';
import toast from 'react-hot-toast';

export function GoogleSignInButton() {
  const navigate = useNavigate();
  const [googleLogin] = useGoogleLoginMutation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google login failed');
      return;
    }

    try {
      // Try login without phone first
      const response = await googleLogin({ 
        idToken: credentialResponse.credential 
      }).unwrap();

      // Check if profile is complete (has phone)
      if (!response.owner.phone || response.owner.phone === '') {
        // Profile incomplete, show modal
        setPendingCredential(credentialResponse.credential);
        setUserName(response.owner.name);
        setShowProfileModal(true);
      } else {
        // Profile complete, redirect to dashboard
        toast.success(`Welcome back, ${response.owner.name}!`);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error?.data?.message || 'Google login failed');
    }
  };

  const handleProfileComplete = async (phone: string) => {
    if (!pendingCredential) return;

    try {
      const response = await googleLogin({ 
        idToken: pendingCredential,
        phone 
      }).unwrap();

      setShowProfileModal(false);
      toast.success(`Welcome, ${response.owner.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast.error('Failed to complete profile');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          '& > div': {
            width: '100% !important',
            display: 'flex !important',
            justifyContent: 'center !important',
          }
        }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google login failed')}
            useOneTap
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
          />
        </Box>
      </Box>

      <ProfileCompletionModal
        open={showProfileModal}
        onComplete={handleProfileComplete}
        userName={userName}
      />
    </>
  );
}
