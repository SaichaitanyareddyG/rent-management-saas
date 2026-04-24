/**
 * Property Form Dialog (MUI)
 * Form for adding/editing properties with auto-location and pincode lookup
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  LocationCity as LocationCityIcon,
  Map as MapIcon,
  Pin as PinIcon,
  Payment as PaymentIcon,
  CalendarMonth as CalendarMonthIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { 
  useCreatePropertyMutation, 
  useUpdatePropertyMutation,
  useGetPropertyByIdQuery 
} from '../services/adminApi';
import toast from 'react-hot-toast';
import type { PropertyRequest } from '../types/api';

interface PropertyFormDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId?: number | null;
}

export const PropertyFormDialog = ({ open, onClose, propertyId }: PropertyFormDialogProps) => {
  const [formData, setFormData] = useState<PropertyRequest>({
    name: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    upiId: '',
    defaultRentDueDay: 5,
  });

  const [gettingLocation, setGettingLocation] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);

  const isEditing = propertyId !== null && propertyId !== undefined;

  const { data: existingProperty } = useGetPropertyByIdQuery(propertyId!, {
    skip: !isEditing,
  });

  const [createProperty, { isLoading: creating, error: createError }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: updating, error: updateError }] = useUpdatePropertyMutation();

  const isLoading = creating || updating;
  const error = createError || updateError;

  // Load existing property data when editing
  useEffect(() => {
    if (existingProperty && isEditing) {
      setFormData({
        name: existingProperty.name,
        addressLine1: existingProperty.addressLine1,
        city: existingProperty.city,
        state: existingProperty.state,
        pincode: existingProperty.pincode,
        upiId: existingProperty.upiId,
        defaultRentDueDay: existingProperty.defaultRentDueDay,
      });
    }
  }, [existingProperty, isEditing]);

  // Auto-fill city and state from pincode
  const fetchLocationFromPincode = async (pincode: string) => {
    if (!/^[0-9]{6}$/.test(pincode)) return;

    setFetchingPincode(true);
    try {
      // Using free India Postal API
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District || prev.city,
          state: postOffice.State || prev.state,
        }));
        toast.success('✅ City and State auto-filled!');
      } else {
        toast.error('Could not find location for this pincode');
      }
    } catch (error) {
      console.error('Pincode lookup failed:', error);
      toast.error('Failed to fetch location from pincode');
    } finally {
      setFetchingPincode(false);
    }
  };

  // Get current location using GPS
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    toast.loading('Getting your location...', { id: 'location' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding using OpenStreetMap Nominatim (free API)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'RentApp/1.0', // Required by Nominatim
              },
            }
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            
            // Extract address components
            const road = addr.road || addr.street || '';
            const suburb = addr.suburb || addr.neighbourhood || '';
            const addressLine = [road, suburb].filter(Boolean).join(', ') || data.display_name;
            
            setFormData(prev => ({
              ...prev,
              addressLine1: addressLine,
              city: addr.city || addr.town || addr.village || prev.city,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode,
            }));

            toast.success('✅ Location detected!', { id: 'location' });
          } else {
            toast.error('Could not get address from location', { id: 'location' });
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          toast.error('Failed to get address from location', { id: 'location' });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        toast.error('Failed to get location. Please enable location access.', { id: 'location' });
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleChange = (field: keyof PropertyRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'defaultRentDueDay' ? Number(value) : value,
    }));

    // Auto-fetch city/state when pincode is complete
    if (field === 'pincode' && value.length === 6) {
      fetchLocationFromPincode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Property name is required');
      return;
    }
    if (!formData.addressLine1.trim()) {
      toast.error('Address is required');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!formData.state.trim()) {
      toast.error('State is required');
      return;
    }
    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      toast.error('Pincode must be 6 digits');
      return;
    }
    if (!formData.upiId.trim()) {
      toast.error('UPI ID is required');
      return;
    }

    try {
      if (isEditing) {
        await updateProperty({ id: propertyId, data: formData }).unwrap();
        toast.success('✅ Property updated successfully!');
      } else {
        await createProperty(formData).unwrap();
        toast.success('✅ Property added successfully!');
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save property:', err);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} property. Please try again.`);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
      upiId: '',
      defaultRentDueDay: 5,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        {isEditing ? 'Edit Property' : 'Add New Property'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to save property. Please check all fields and try again.
            </Alert>
          )}

          {!isEditing && (
            <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
              <strong>💡 Smart Features:</strong> Click the 📍 icon to auto-detect your location, or enter a pincode to auto-fill city & state!
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Property Name */}
            <TextField
              label="Property Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              fullWidth
              placeholder="e.g., Sunrise PG, Green Valley Hostel"
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

            {/* Address with Auto-Locate */}
            <TextField
              label="Address"
              value={formData.addressLine1}
              onChange={handleChange('addressLine1')}
              required
              fullWidth
              multiline
              rows={2}
              placeholder="Street address, building number, landmark"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <LocationOnIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <Tooltip title="Auto-detect my location">
                        <IconButton
                          onClick={handleAutoLocate}
                          disabled={gettingLocation}
                          color="primary"
                          size="small"
                        >
                          {gettingLocation ? (
                            <CircularProgress size={20} />
                          ) : (
                            <MyLocationIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* City, State, Pincode */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
                required
                fullWidth
                placeholder="e.g., Bangalore, Mumbai"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCityIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="State"
                value={formData.state}
                onChange={handleChange('state')}
                required
                fullWidth
                placeholder="e.g., Karnataka, Maharashtra"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <TextField
              label="Pincode"
              value={formData.pincode}
              onChange={handleChange('pincode')}
              required
              fullWidth
              placeholder="560001"
              helperText={fetchingPincode ? "Fetching city and state..." : "Enter 6-digit pincode - auto-fills city & state"}
              slotProps={{
                htmlInput: { maxLength: 6 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: fetchingPincode ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            {/* UPI ID */}
            <TextField
              label="UPI ID"
              value={formData.upiId}
              onChange={handleChange('upiId')}
              required
              fullWidth
              placeholder="yourname@paytm"
              helperText="UPI ID for receiving rent payments"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaymentIcon color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Default Rent Due Day */}
            <TextField
              label="Default Rent Due Day"
              type="number"
              value={formData.defaultRentDueDay}
              onChange={handleChange('defaultRentDueDay')}
              fullWidth
              helperText="Day of month when rent is due (1-31)"
              slotProps={{
                htmlInput: { min: 1, max: 31 },
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
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={isLoading} variant="outlined">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
              },
            }}
          >
            {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Property' : 'Add Property')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
