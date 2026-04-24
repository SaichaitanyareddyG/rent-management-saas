/**
 * Payment Success Page (PUBLIC)
 * MUI components only
 */

import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

export const PaymentSuccessPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 600, borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
          {/* Success Icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                fontWeight: 'bold',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              }}
            >
              ✓
            </Box>
          </Box>

          {/* Message */}
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Payment Submitted!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Your payment has been submitted for verification.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            You will receive a confirmation once the payment is verified by the property owner.
          </Typography>

          {/* Info Box */}
          <Box
            sx={{
              bgcolor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 2,
              p: 3,
              textAlign: 'left',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#0369a1' }}>
              What happens next?
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <VerifiedIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2">Property owner will verify your UTR</Typography>}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2">Payment status will be updated to "Paid"</Typography>}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <NotificationsIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2">You'll receive confirmation (if contact details provided)</Typography>}
                />
              </ListItem>
            </List>
          </Box>

          {/* Footer */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontStyle: 'italic' }}>
            Thank you for using RentApp Payment Portal
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
