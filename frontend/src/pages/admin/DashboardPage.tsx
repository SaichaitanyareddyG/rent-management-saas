/**
 * Dashboard Page
 * Real-world rental property management dashboard with MUI
 */

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetDashboardSummaryQuery } from '../../services/adminApi';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  MeetingRoom as RoomIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export const DashboardPage = () => {
  const { data, isLoading, error, refetch } = useGetDashboardSummaryQuery();

  useEffect(() => {
    // Welcome message on dashboard load
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      toast.success(`🏠 Welcome to RentApp Dashboard!`, {
        id: 'welcome-toast', // Prevent duplicate toasts
      });
    }
  }, []);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load dashboard data. Please try again.');
    }
  }, [error]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 'medium' }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <Card
          sx={{
            maxWidth: 400,
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'error.light',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'error.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <WarningIcon sx={{ fontSize: 32, color: 'error.main' }} />
            </Box>
            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>
              Error loading dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Unable to fetch your property data
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => {
                toast.loading('Refreshing dashboard...', { id: 'refresh' });
                refetch().then(() => toast.success('Dashboard refreshed!', { id: 'refresh' }));
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Payment distribution data for pie chart
  const paymentData = [
    { name: 'Paid', value: data?.paidPayments || 0, color: '#10B981' },
    { name: 'Pending', value: data?.pendingPayments || 0, color: '#F59E0B' },
    { name: 'Verify', value: data?.verifyPayments || 0, color: '#3B82F6' },
  ];

  // Revenue data for bar chart (mock data - replace with API)
  const revenueData = [
    { month: 'Jan', revenue: 45000, expected: 50000 },
    { month: 'Feb', revenue: 52000, expected: 50000 },
    { month: 'Mar', revenue: 48000, expected: 50000 },
    { month: 'Apr', revenue: data?.monthlyRevenue || 0, expected: data?.expectedMonthlyRevenue || 0 },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      {/* Payment Verification Alert */}
      {data && data.verifyPayments > 0 && (
        <Card
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '2px solid #3B82F6',
            bgcolor: '#EFF6FF',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                  },
                }}
              >
                <WarningIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E40AF', mb: 0.5 }}>
                  {data.verifyPayments} Payment{data.verifyPayments > 1 ? 's' : ''} Awaiting Verification
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Tenants have submitted payment confirmations. Review and verify them now.
                </Typography>
              </Box>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#3B82F6',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    bgcolor: '#2563EB',
                    boxShadow: '0 6px 12px rgba(59, 130, 246, 0.4)',
                  },
                }}
                onClick={() => window.location.href = '/payments'}
              >
                Verify Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Header with Rental Theme */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
          color: 'white',
          mb: 3,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                🏠 Property Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: '#e0e7ff' }}>
                Manage your rental properties efficiently
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              <Typography variant="caption" sx={{ color: '#c7d2fe' }}>
                Current Period
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'semibold' }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid with Rental Theme */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Properties */}
        <Card
          sx={{
            borderLeft: '4px solid #6366f1',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Properties
              </Typography>
              <HomeIcon sx={{ fontSize: 28, color: '#6366f1' }} />
            </Box>
            <Typography variant="h4" color="text.primary" sx={{ fontWeight: 'bold' }}>
              {data?.totalProperties || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total buildings
            </Typography>
          </CardContent>
        </Card>

        {/* Rooms */}
        <Card
          sx={{
            borderLeft: '4px solid #3b82f6',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Rooms
              </Typography>
              <RoomIcon sx={{ fontSize: 28, color: '#3b82f6' }} />
            </Box>
            <Typography variant="h4" color="text.primary" sx={{ fontWeight: 'bold' }}>
              {data?.totalRooms || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Available units
            </Typography>
          </CardContent>
        </Card>

        {/* Occupancy */}
        <Card
          sx={{
            borderLeft: '4px solid #10b981',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Occupancy
              </Typography>
              <AssessmentIcon sx={{ fontSize: 28, color: '#10b981' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10b981' }}>
              {data?.occupancyRate.toFixed(1) || 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data?.occupiedRooms || 0} of {data?.totalRooms || 0} occupied
            </Typography>
          </CardContent>
        </Card>

        {/* Total Tenants */}
        <Card
          sx={{
            borderLeft: '4px solid #9333ea',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Tenants
              </Typography>
              <PeopleIcon sx={{ fontSize: 28, color: '#9333ea' }} />
            </Box>
            <Typography variant="h4" color="text.primary" sx={{ fontWeight: 'bold' }}>
              {data?.totalTenants || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Registered tenants
            </Typography>
          </CardContent>
        </Card>

        {/* Active Tenants */}
        <Card
          sx={{
            borderLeft: '4px solid #059669',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Active
              </Typography>
              <CheckCircleIcon sx={{ fontSize: 28, color: '#059669' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#059669' }}>
              {data?.activeTenants || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Currently renting
            </Typography>
          </CardContent>
        </Card>

        {/* Inactive Tenants */}
        <Card
          sx={{
            borderLeft: '4px solid #9ca3af',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Inactive
              </Typography>
              <CancelIcon sx={{ fontSize: 28, color: '#9ca3af' }} />
            </Box>
            <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              {data?.inactiveTenants || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Former tenants
            </Typography>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.9 }}>
                Monthly Revenue
              </Typography>
              <TrendingUpIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ₹{data?.monthlyRevenue.toLocaleString() || 0}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Current month
            </Typography>
          </CardContent>
        </Card>

        {/* Expected Revenue */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.9 }}>
                Expected
              </Typography>
              <span style={{ fontSize: '28px' }}>🎯</span>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ₹{data?.expectedMonthlyRevenue.toLocaleString() || 0}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Projected income
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Total Revenue Highlight */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 50%, #ec4899 100%)',
          color: 'white',
          mb: 3,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.9, mb: 1 }}>
                Total Revenue (All Time)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                ₹{data?.totalRevenue.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
                From all properties and tenants
              </Typography>
            </Box>
            <Box sx={{ fontSize: '4rem', opacity: 0.8, display: { xs: 'none', md: 'block' } }}>
              🏆
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Revenue Trend Chart */}
        <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📈 Revenue Trend
                </Typography>
                <Chip label="Last 4 months" size="small" variant="outlined" />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6366F1" name="Collected ₹" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expected" fill="#C7D2FE" name="Expected ₹" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        {/* Payment Distribution Chart */}
        <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  💳 Payment Status
                </Typography>
                <Chip label="Current distribution" size="small" variant="outlined" />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
      </Box>

      {/* Payment Stats Summary */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Card
            sx={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              border: '2px solid #10b981',
              borderRadius: 3,
              transition: 'box-shadow 0.3s',
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#047857', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Paid
                </Typography>
                <span style={{ fontSize: '24px' }}>✅</span>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#065f46' }}>
                {data?.paidPayments || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669' }}>
                Payments received
              </Typography>
            </CardContent>
          </Card>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b',
            borderRadius: 3,
            transition: 'box-shadow 0.3s',
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#b45309', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pending
              </Typography>
              <span style={{ fontSize: '24px' }}>⏳</span>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#92400e' }}>
              {data?.pendingPayments || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#d97706' }}>
              Awaiting payment
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            border: '2px solid #3b82f6',
            borderRadius: 3,
            transition: 'box-shadow 0.3s',
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Verify
              </Typography>
              <span style={{ fontSize: '24px' }}>🔍</span>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
              {data?.verifyPayments || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#2563eb' }}>
              Need verification
            </Typography>
            </CardContent>
          </Card>
      </Box>
    </Box>
  );
};
