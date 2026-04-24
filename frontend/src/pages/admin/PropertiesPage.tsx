/**
 * Properties Management Page (ADMIN)
 * MUI components only - Full CRUD for properties
 */

import { useState } from 'react';
import { useGetAllPropertiesQuery, useDeletePropertyMutation } from '../../services/adminApi';
import { PropertyFormDialog } from '../../components/PropertyFormDialog';
import { downloadCsvFromApi } from '../../utils/download';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  MeetingRoom as MeetingRoomIcon,
  Hotel as HotelIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export const PropertiesPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: properties, isLoading, error } = useGetAllPropertiesQuery();
  const [deleteProperty] = useDeletePropertyMutation();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete property "${name}"? This will also delete all associated rooms and tenants.`)) {
      try {
        await deleteProperty(id).unwrap();
        toast.success('✅ Property deleted successfully!');
      } catch (err) {
        console.error('Failed to delete property:', err);
        toast.error('Failed to delete property. It may have active tenants.');
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      await downloadCsvFromApi(`${baseUrl}/properties/export`, 'properties.csv');
      toast.success('Properties exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export properties');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
        <Skeleton variant="text" width="25%" height={40} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>Error loading properties</Typography>
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
          🏢 Properties
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
            onClick={() => {
              setEditingProperty(null);
              setOpenDialog(true);
            }}
          >
            Add Property
          </Button>
        </Box>
      </Box>

      {/* No Properties State */}
      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <HomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>No Properties Yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first property to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {/* Desktop Table */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Property Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rooms</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Beds</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Occupancy</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>UPI ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HomeIcon color="primary" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                            {property.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {property.addressLine1}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {property.city}, {property.state} - {property.pincode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<MeetingRoomIcon />}
                          label={property.totalRooms || 0} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<HotelIcon />}
                          label={property.totalBeds || 0} 
                          size="small" 
                          color="info" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "semibold" }}>
                            {property.occupiedBeds || 0}/{property.totalBeds || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {property.totalBeds ? Math.round(((property.occupiedBeds || 0) / property.totalBeds) * 100) : 0}% full
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {property.upiId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              setEditingProperty(property.id);
                              setOpenDialog(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(property.id, property.name)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile Cards */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {properties.map((property, index) => (
              <Box
                key={property.id}
                sx={{
                  p: 2,
                  borderTop: index > 0 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HomeIcon color="primary" />
                    <Typography variant="body1" sx={{ fontWeight: "semibold" }}>
                      {property.name}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {property.addressLine1}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  {property.city}, {property.state} - {property.pincode}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Rooms</Typography>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {property.totalRooms || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Beds</Typography>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {property.totalBeds || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Occupied</Typography>
                    <Typography variant="body2" sx={{ fontWeight: "semibold" }}>
                      {property.occupiedBeds || 0}/{property.totalBeds || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">UPI ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {property.upiId}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    sx={{ flex: 1 }}
                    onClick={() => {
                      setEditingProperty(property.id);
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    sx={{ flex: 1 }}
                    onClick={() => handleDelete(property.id, property.name)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      {/* Property Form Dialog */}
      <PropertyFormDialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditingProperty(null);
        }}
        propertyId={editingProperty}
      />
    </Box>
  );
};
