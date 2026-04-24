/**
 * Tenants Management Page (ADMIN)
 * Modern property-wise grouped view with expandable cards
 */

import { useState, useMemo } from 'react';
import { useGetTenantsPaginatedQuery, useGetAllPropertiesQuery } from '../../services/adminApi';
import type { TenantStatus } from '../../types/api';
import { TenantFormDialog } from '../../components/TenantFormDialog';
import { downloadCsvFromApi } from '../../utils/download';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Skeleton,
  Alert,
  InputAdornment,
  IconButton,
  Pagination,
  Collapse,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  Room as RoomIcon,
} from '@mui/icons-material';

export const TenantsPage = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(100); // Load more for grouping
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useGetTenantsPaginatedQuery({
    page,
    size,
    sort: 'propertyName',
    direction: 'ASC',
  });

  const { data: properties, isLoading: propertiesLoading } = useGetAllPropertiesQuery();

  // Filter and group tenants
  const { filteredTenants, groupedTenants, stats } = useMemo(() => {
    const allTenants = data?.content || [];
    
    // Filter by search term and property
    let filtered = allTenants.filter((tenant) => {
      const matchesSearch = !searchTerm || 
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProperty = selectedProperty === 'all' || 
        tenant.propertyId.toString() === selectedProperty;
      
      return matchesSearch && matchesProperty;
    });

    // Group by property
    const grouped = filtered.reduce((acc, tenant) => {
      const propertyName = tenant.propertyName || 'Unknown Property';
      if (!acc[propertyName]) {
        acc[propertyName] = [];
      }
      acc[propertyName].push(tenant);
      return acc;
    }, {} as Record<string, typeof allTenants>);

    // Calculate stats
    const activeCount = filtered.filter(t => t.status === 'ACTIVE').length;
    const inactiveCount = filtered.filter(t => t.status === 'INACTIVE').length;

    return {
      filteredTenants: filtered,
      groupedTenants: grouped,
      stats: { total: filtered.length, active: activeCount, inactive: inactiveCount }
    };
  }, [data?.content, searchTerm, selectedProperty]);

  const toggleCard = (tenantId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantId)) {
        newSet.delete(tenantId);
      } else {
        newSet.add(tenantId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: TenantStatus): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      await downloadCsvFromApi(`${baseUrl}/tenants/export`, 'tenants.csv');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export tenants. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || propertiesLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
        <Skeleton variant="text" width="25%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>Error loading tenants</Typography>
          <Typography variant="body2">Please try again later</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Tenants
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ fontWeight: 'bold' }}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ fontWeight: 'bold' }}
            onClick={() => setOpenDialog(true)}
          >
            Add Tenant
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search by name, phone, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
            
            {/* Property Filter */}
            <FormControl sx={{ minWidth: { xs: '100%', md: 250 } }}>
              <InputLabel>Property</InputLabel>
              <Select
                value={selectedProperty}
                label="Property"
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HomeIcon fontSize="small" />
                    All Properties
                  </Box>
                </MenuItem>
                {properties?.map((property) => (
                  <MenuItem key={property.id} value={property.id.toString()}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon fontSize="small" />
                      {property.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}>
          <CardContent>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
              Total Tenants
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
              {stats.total}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
        }}>
          <CardContent>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
              Active
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
              {stats.active}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
        }}>
          <CardContent>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
              Inactive
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
              {stats.inactive}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
        }}>
          <CardContent>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
              Properties
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
              {Object.keys(groupedTenants).length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tenants Grouped by Property */}
      {filteredTenants.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 12, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tenants found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try adjusting your filters or search
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(groupedTenants).map(([propertyName, tenants]) => (
            <Card key={propertyName} sx={{ overflow: 'visible' }}>
              <CardContent sx={{ pb: 1 }}>
                {/* Property Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <HomeIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {propertyName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Tenant Cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {tenants.map((tenant) => {
                    const isExpanded = expandedCards.has(tenant.id);
                    return (
                      <Card
                        key={tenant.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: 3,
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                          {/* Tenant Header - Always Visible */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                            onClick={() => toggleCard(tenant.id)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                <PersonIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                  {tenant.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <RoomIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                                    Room {tenant.roomNumber}
                                  </Typography>
                                  <Chip
                                    label={tenant.status}
                                    color={getStatusColor(tenant.status)}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    ₹{tenant.rentAmount.toLocaleString()}/mo
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            <IconButton
                              size="small"
                              sx={{
                                transition: 'transform 0.3s ease',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              }}
                            >
                              <ExpandMoreIcon />
                            </IconButton>
                          </Box>

                          {/* Expanded Details */}
                          <Collapse in={isExpanded} timeout="auto">
                            <Box sx={{ mt: 3 }}>
                              <Divider sx={{ mb: 2 }} />
                              
                              {/* Contact Information */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: 'text.secondary' }}>
                                  Contact Information
                                </Typography>
                                <Stack spacing={1.5}>
                                  {tenant.contactNumber && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <PhoneIcon sx={{ color: 'action.active', fontSize: '1.2rem' }} />
                                      <Typography variant="body2">{tenant.contactNumber}</Typography>
                                    </Box>
                                  )}
                                  {tenant.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <EmailIcon sx={{ color: 'action.active', fontSize: '1.2rem' }} />
                                      <Typography variant="body2">{tenant.email}</Typography>
                                    </Box>
                                  )}
                                  {tenant.emergencyContact && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <PhoneIcon sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                                      <Typography variant="body2">
                                        <strong>Emergency:</strong> {tenant.emergencyContact}
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>

                              {/* Additional Details */}
                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                  gap: 2,
                                  mb: 2,
                                }}
                              >
                                {tenant.companyOrCollege && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <BusinessIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                                      Company/College
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                                      {tenant.companyOrCollege}
                                    </Typography>
                                  </Box>
                                )}
                                {tenant.joiningDate && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <CalendarIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                                      Joining Date
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                                      {new Date(tenant.joiningDate).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                )}
                                {tenant.advanceAmount > 0 && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <BankIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                                      Advance
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', mt: 0.5 }}>
                                      ₹{tenant.advanceAmount.toLocaleString()}
                                    </Typography>
                                  </Box>
                                )}
                                {tenant.guardianName && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Guardian Name
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                                      {tenant.guardianName}
                                    </Typography>
                                  </Box>
                                )}
                                {tenant.nativeAddress && (
                                  <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Native Address
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                                      {tenant.nativeAddress}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>

                              {tenant.notes && (
                                <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                    Notes
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {tenant.notes}
                                  </Typography>
                                </Box>
                              )}

                              {/* Actions */}
                              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<EditIcon />}
                                  sx={{ flex: 1 }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  sx={{ flex: 1 }}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Tenant Form Dialog */}
      <TenantFormDialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
      />
    </Box>
  );
};
