/**
 * Admin Layout Component
 * Fully responsive sidebar + header with MUI + Tailwind CSS
 */

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useLogoutMutation } from '../services/authApi';
import { useIsMobile } from '../hooks/useResponsive';
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
} from '@mui/icons-material';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logout] = useLogoutMutation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#6366f1' : 'transparent',
                  color: isActive ? '#ffffff' : '#374151',
                  '&:hover': {
                    backgroundColor: isActive ? '#4f46e5' : '#f3f4f6',
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
                  {item.icon}
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
            sx={{ display: { xs: 'block', md: 'none' } }}
            size="large"
          >
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {/* Desktop Spacer */}
          <div className="hidden md:block"></div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
