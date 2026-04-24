/**
 * Room Form Dialog (MUI)
 * Form for adding/editing rooms with capacity
 */

import { useState } from 'react';
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
  MeetingRoom as MeetingRoomIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import { 
  useGetAllPropertiesQuery,
  useCreateRoomMutation, 
  useUpdateRoomMutation 
} from '../services/adminApi';
import toast from 'react-hot-toast';
import type { RoomRequest } from '../types/api';

interface RoomFormDialogProps {
  open: boolean;
  onClose: () => void;
  roomId?: number | null;
}

export const RoomFormDialog = ({ open, onClose, roomId }: RoomFormDialogProps) => {
  const [formData, setFormData] = useState<RoomRequest>({
    roomNumber: '',
    capacity: 1,
    propertyId: 0,
  });

  const isEditing = roomId !== null && roomId !== undefined;

  const { data: properties, isLoading: propertiesLoading } = useGetAllPropertiesQuery();
  const [createRoom, { isLoading: creating, error: createError }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: updating, error: updateError }] = useUpdateRoomMutation();

  const isLoading = creating || updating;
  const error = createError || updateError;

  const handleChange = (field: keyof RoomRequest) => (
    e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'capacity' || field === 'propertyId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.roomNumber.trim()) {
      toast.error('Room number is required');
      return;
    }
    if (formData.capacity < 1) {
      toast.error('Capacity must be at least 1');
      return;
    }
    if (formData.propertyId === 0) {
      toast.error('Please select a property');
      return;
    }

    try {
      if (isEditing) {
        await updateRoom({ id: roomId, data: formData }).unwrap();
        toast.success('✅ Room updated successfully!');
      } else {
        await createRoom(formData).unwrap();
        toast.success('✅ Room added successfully!');
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save room:', err);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} room. Please try again.`);
    }
  };

  const handleClose = () => {
    setFormData({
      roomNumber: '',
      capacity: 1,
      propertyId: 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        {isEditing ? 'Edit Room' : 'Add New Room'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to save room. Please check all fields and try again.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Property Selection */}
            <FormControl fullWidth required>
              <InputLabel>Property</InputLabel>
              <Select
                value={formData.propertyId}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyId: Number(e.target.value) }))}
                label="Property"
                disabled={propertiesLoading || isEditing}
              >
                <MenuItem value={0}>
                  <em>Select a property</em>
                </MenuItem>
                {properties?.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name} - {property.city}
                  </MenuItem>
                ))}
              </Select>
              {propertiesLoading && (
                <FormHelperText>Loading properties...</FormHelperText>
              )}
              {isEditing && (
                <FormHelperText>Property cannot be changed when editing</FormHelperText>
              )}
            </FormControl>

            {/* Room Number */}
            <TextField
              label="Room Number"
              value={formData.roomNumber}
              onChange={handleChange('roomNumber')}
              required
              fullWidth
              placeholder="101, 102, A1, B2, etc."
              helperText="Unique identifier for this room"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MeetingRoomIcon color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Capacity */}
            <TextField
              label="Bed Capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange('capacity')}
              required
              fullWidth
              helperText="How many beds/tenants can this room accommodate?"
              slotProps={{
                htmlInput: { min: 1, max: 20 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <HotelIcon color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Info Box */}
            <Alert severity="info" variant="outlined">
              <strong>Capacity Examples:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Single Sharing: Capacity = 1</li>
                <li>Double Sharing: Capacity = 2</li>
                <li>Triple Sharing: Capacity = 3</li>
                <li>Dormitory: Capacity = 4+</li>
              </ul>
            </Alert>
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
            {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Room' : 'Add Room')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
