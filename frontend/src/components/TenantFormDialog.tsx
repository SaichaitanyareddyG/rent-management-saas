/**
 * Tenant Form Dialog (MUI)
 * Comprehensive form for adding new tenants
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  ContactPhone as ContactPhoneIcon,
  SupervisorAccount as SupervisorAccountIcon,
  CreditCard as CreditCardIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  CalendarMonth as CalendarMonthIcon,
  EventRepeat as EventRepeatIcon,
  Payments as PaymentsIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { useCreateTenantMutation } from '../services/adminApi';
import { useGetAllPropertiesQuery, useGetRoomsByPropertyQuery } from '../services/adminApi';
import toast from 'react-hot-toast';
import type { TenantRequest } from '../types/api';

interface TenantFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TenantFormDialog = ({ open, onClose }: TenantFormDialogProps) => {
  const [formData, setFormData] = useState<TenantRequest>({
    name: '',
    phone: '',
    email: '',
    nativeAddress: '',
    companyOrCollege: '',
    emergencyContact: '',
    guardianName: '',
    aadharNumber: '',
    rentAmount: 0,
    propertyId: 0,
    roomId: 0,
    joiningDate: new Date().toISOString().split('T')[0],
    rentDueDay: 5,
    advanceAmount: 0,
    notes: '',
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(0);

  const { data: properties, isLoading: propertiesLoading } = useGetAllPropertiesQuery();
  const { data: rooms, isLoading: roomsLoading } = useGetRoomsByPropertyQuery(selectedPropertyId, {
    skip: selectedPropertyId === 0,
  });

  const [createTenant, { isLoading: creating, error }] = useCreateTenantMutation();

  // Reset rooms when property changes
  useEffect(() => {
    if (selectedPropertyId > 0) {
      setFormData(prev => ({ ...prev, propertyId: selectedPropertyId, roomId: 0 }));
    }
  }, [selectedPropertyId]);

  const handleChange = (field: keyof TenantRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'rentAmount' || field === 'rentDueDay' || field === 'advanceAmount'
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Tenant name is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (formData.rentAmount <= 0) {
      toast.error('Rent amount must be greater than 0');
      return;
    }
    if (formData.propertyId === 0) {
      toast.error('Please select a property');
      return;
    }
    if (formData.roomId === 0) {
      toast.error('Please select a room');
      return;
    }

    try {
      await createTenant(formData).unwrap();
      toast.success('✅ Tenant added successfully!');
      handleClose();
    } catch (err) {
      console.error('Failed to create tenant:', err);
      toast.error('Failed to add tenant. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      nativeAddress: '',
      companyOrCollege: '',
      emergencyContact: '',
      guardianName: '',
      aadharNumber: '',
      rentAmount: 0,
      propertyId: 0,
      roomId: 0,
      joiningDate: new Date().toISOString().split('T')[0],
      rentDueDay: 5,
      advanceAmount: 0,
      notes: '',
    });
    setSelectedPropertyId(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        Add New Tenant
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to add tenant. Please check all fields and try again.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Basic Information */}
            <Box>
              <Box sx={{ fontWeight: 'bold', mb: 1.5, color: '#667eea' }}>
                📋 Basic Information
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Tenant Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  required
                  fullWidth
                  placeholder="1234567890"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  fullWidth
                  placeholder="tenant@example.com"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Guardian/Father's Name"
                  value={formData.guardianName}
                  onChange={handleChange('guardianName')}
                  fullWidth
                  placeholder="Father's or Guardian's name"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SupervisorAccountIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Emergency Contact Number"
                  value={formData.emergencyContact}
                  onChange={handleChange('emergencyContact')}
                  fullWidth
                  placeholder="1234567890"
                  helperText="Alternative contact for emergencies"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <ContactPhoneIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Native Address"
                  value={formData.nativeAddress}
                  onChange={handleChange('nativeAddress')}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Permanent/hometown address"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <HomeIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Company/College Name"
                  value={formData.companyOrCollege}
                  onChange={handleChange('companyOrCollege')}
                  fullWidth
                  placeholder="Current workplace or educational institution"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Aadhar Number"
                  value={formData.aadharNumber}
                  onChange={handleChange('aadharNumber')}
                  fullWidth
                  placeholder="123456789012"
                  helperText="12 digit Aadhar number (will be masked for security)"
                  slotProps={{
                    htmlInput: { maxLength: 12 },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Property & Room Selection */}
            <Box>
              <Box sx={{ fontWeight: 'bold', mb: 1.5, color: '#667eea' }}>
                🏠 Property & Room
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                    label="Property"
                    disabled={propertiesLoading}
                  >
                    <MenuItem value={0}>
                      <em>Select a property</em>
                    </MenuItem>
                    {properties?.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} - {property.city}, {property.state}
                      </MenuItem>
                    ))}
                  </Select>
                  {propertiesLoading && (
                    <FormHelperText>Loading properties...</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth required disabled={selectedPropertyId === 0}>
                  <InputLabel>Room</InputLabel>
                  <Select
                    value={formData.roomId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomId: Number(e.target.value) }))}
                    label="Room"
                    disabled={roomsLoading || selectedPropertyId === 0}
                  >
                    <MenuItem value={0}>
                      <em>Select a room</em>
                    </MenuItem>
                    {rooms?.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        Room {room.roomNumber} (Capacity: {room.capacity}, Occupied: {room.occupiedCount})
                      </MenuItem>
                    ))}
                  </Select>
                  {selectedPropertyId === 0 && (
                    <FormHelperText>Please select a property first</FormHelperText>
                  )}
                  {roomsLoading && selectedPropertyId > 0 && (
                    <FormHelperText>Loading rooms...</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>

            {/* Financial Details */}
            <Box>
              <Box sx={{ fontWeight: 'bold', mb: 1.5, color: '#667eea' }}>
                💰 Financial Details
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Monthly Rent"
                  type="number"
                  value={formData.rentAmount}
                  onChange={handleChange('rentAmount')}
                  required
                  fullWidth
                  slotProps={{
                    htmlInput: { min: 0, step: 100 },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Rent Due Day"
                  type="number"
                  value={formData.rentDueDay}
                  onChange={handleChange('rentDueDay')}
                  fullWidth
                  helperText="Day of month (1-31)"
                  slotProps={{
                    htmlInput: { min: 1, max: 31 },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventRepeatIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Advance Amount"
                  type="number"
                  value={formData.advanceAmount}
                  onChange={handleChange('advanceAmount')}
                  fullWidth
                  slotProps={{
                    htmlInput: { min: 0, step: 100 },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaymentsIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Joining Date */}
            <Box>
              <Box sx={{ fontWeight: 'bold', mb: 1.5, color: '#667eea' }}>
                📅 Joining Details
              </Box>
              
              <TextField
                label="Joining Date"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange('joiningDate')}
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* Notes */}
            <Box>
              <Box sx={{ fontWeight: 'bold', mb: 1.5, color: '#667eea' }}>
                📝 Additional Notes
              </Box>
              
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={handleChange('notes')}
                fullWidth
                multiline
                rows={3}
                placeholder="Any additional information about the tenant..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <NotesIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={creating} variant="outlined">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={creating}
            startIcon={creating ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
              },
            }}
          >
            {creating ? 'Adding...' : 'Add Tenant'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
