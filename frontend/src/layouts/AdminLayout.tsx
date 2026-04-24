/**
 * Admin Layout Component
 * Fully responsive sidebar + header with MUI + Tailwind CSS
 */

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useLogoutMutation } from '../services/authApi';
import { useGetDashboardSummaryQuery } from '../services/dashboardApi';
import { useIsMobile } from '../hooks/useResponsive';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { Badge } from '../components/Badge';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge as MuiBadge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Home as HomeIcon,
  MeetingRoom as RoomIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logout] = useLogoutMutation();
  const { data: dashboardData } = useGetDashboardSummaryQuery();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
Session timeout: 30 minutes of inactivity
  useSessionTimeout({
    timeout: 30 * 60 * 1000,      // 30 minutes
    warningTime: 2 * 60 * 1000,   // Warn 2 minutes before
    enabled: true,                // Enable session timeout
  });

  // 
  // Get pending verification count
  const pendingVerifications = dashboardData?.verifyPayments || 0;

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';
  const userEmail = user.email || '';

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/tenants', label: 'Tenants', icon: <PeopleIcon /> },
    { path: '/payments', label: 'Payments', icon: <PaymentIcon /> },
    { path: '/properties', label: 'Properties', icon: <HomeIcon /> },
    { path: '/rooms', label: 'Rooms', icon: <RoomIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
          🏠 RentApp
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Admin Panel
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ p: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showBadge = item.path === '/payments' && pendingVerifications > 0;
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#6366f1' : 'transparent',
                  color: isActive ? '#ffffff' : '#374151',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: isActive ? '#4f46e5' : '#f3f4f6',
                    transform: 'translateX(4px)',
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#ffffff' : '#6b7280',
                    minWidth: '40px',
                  }}
                >
                  {showBadge ? (
                    <Badge count={pendingVerifications}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      style: {
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 256,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 256,
            boxSizing: 'border-box',
            borderRight: '1px solid #e5e7eb',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Sidebar - Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 256,
            boxSizing: 'border-box',
          },
        }}
        ModalProps={{
          keepMounted: true, // Better mobile performance
          slotProps: {
            backdrop: {
              sx: {
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
          },
        }}
        slotProps={{
          paper: {
            sx: {
              transition: 'transform 0.3s ease-in-out !important',
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
          {/* Mobile Menu Button */}
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ 
              display: { xs: 'block', md: 'none' },
              transition: 'all 0.3s ease',
              transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              '&:hover': {
                bgcolor: '#F3F4F6',
                transform: sidebarOpen ? 'rotate(90deg) scale(1.1)' : 'rotate(0deg) scale(1.1)',
              }
            }}
            size="large"
          >
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {/* Desktop Spacer */}
          <div className="hidden md:block flex-1"></div>

          {/* Profile Dropdown */}
          <Box>
            <Button
              onClick={handleProfileMenuOpen}
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#F3F4F6',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#6366F1',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(userName)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1F2937', lineHeight: 1.2 }}>
                  {userName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1 }}>
                  Owner
                </Typography>
              </Box>
              <ArrowDownIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
            </Button>

            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 220,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E5E7EB' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1F2937' }}>
                  {userName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {userEmail}
                </Typography>
              </Box>
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose();
                  navigate('/settings');
                }}
                sx={{ gap: 1.5, py: 1.5 }}
              >
                <SettingsIcon fontSize="small" sx={{ color: '#6B7280' }} />
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose();
                  handleLogout();
                }}
                sx={{ gap: 1.5, py: 1.5, color: '#EF4444' }}
              >
                <LogoutIcon fontSize="small" />
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
