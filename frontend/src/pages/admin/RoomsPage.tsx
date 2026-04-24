/**
 * Rooms Management Page (ADMIN)
 * MUI components only - Full CRUD for rooms with capacity tracking
 */

import { useState } from 'react';
import { useGetAllRoomsQuery, useDeleteRoomMutation } from '../../services/adminApi';
import { RoomFormDialog } from '../../components/RoomFormDialog';
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
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MeetingRoom as MeetingRoomIcon,
  Hotel as HotelIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export const RoomsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: rooms, isLoading, error } = useGetAllRoomsQuery();
  const [deleteRoom] = useDeleteRoomMutation();

  const handleDelete = async (id: number, roomNumber: string) => {
    if (confirm(`Are you sure you want to delete Room ${roomNumber}? This will also remove all tenants in this room.`)) {
      try {
        await deleteRoom(id).unwrap();
        toast.success('✅ Room deleted successfully!');
      } catch (err) {
        console.error('Failed to delete room:', err);
        toast.error('Failed to delete room. It may have active tenants.');
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      await downloadCsvFromApi(`${baseUrl}/rooms/export`, 'rooms.csv');
      toast.success('Rooms exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export rooms');
    } finally {
      setIsExporting(false);
    }
  };

  const getOccupancyColor = (occupied: number, capacity: number): 'success' | 'warning' | 'error' => {
    const percentage = (occupied / capacity) * 100;
    if (percentage === 0) return 'success';
    if (percentage < 100) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
        <Skeleton variant="text" width="25%" height={40} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>Error loading rooms</Typography>
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
          🛏️ Rooms
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
              setEditingRoom(null);
              setOpenDialog(true);
            }}
          >
            Add Room
          </Button>
        </Box>
      </Box>

      {/* No Rooms State */}
      {!rooms || rooms.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <MeetingRoomIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>No Rooms Yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add properties first, then create rooms with bed capacity
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add First Room
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Room Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Occupied</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Available</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Occupancy</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rooms.map((room) => {
                    const occupancyPercent = (room.occupiedCount / room.capacity) * 100;
                    return (
                      <TableRow key={room.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MeetingRoomIcon color="primary" fontSize="small" />
                            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                              Room {room.roomNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{room.propertyName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={<HotelIcon />}
                            label={`${room.capacity} beds`} 
                            size="small" 
                            color="info" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: "semibold" }}>
                            {room.occupiedCount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={room.availableBeds} 
                            size="small" 
                            color={room.availableBeds > 0 ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={occupancyPercent} 
                              color={getOccupancyColor(room.occupiedCount, room.capacity)}
                              sx={{ mb: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(occupancyPercent)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                setEditingRoom(room.id);
                                setOpenDialog(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(room.id, room.roomNumber)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile Cards */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {rooms.map((room, index) => {
              const occupancyPercent = (room.occupiedCount / room.capacity) * 100;
              return (
                <Box
                  key={room.id}
                  sx={{
                    p: 2,
                    borderTop: index > 0 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MeetingRoomIcon color="primary" />
                      <Typography variant="body1" sx={{ fontWeight: "semibold" }}>
                        Room {room.roomNumber}
                      </Typography>
                    </Box>
                    <Chip 
                      label={room.availableBeds > 0 ? 'Available' : 'Full'} 
                      size="small" 
                      color={room.availableBeds > 0 ? 'success' : 'error'}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {room.propertyName}
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacity</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {room.capacity}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Occupied</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "semibold" }}>
                        {room.occupiedCount}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Available</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "medium", color: room.availableBeds > 0 ? 'success.main' : 'error.main' }}>
                        {room.availableBeds}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={occupancyPercent} 
                      color={getOccupancyColor(room.occupiedCount, room.capacity)}
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(occupancyPercent)}% occupied
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{ flex: 1 }}
                      onClick={() => {
                        setEditingRoom(room.id);
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
                      onClick={() => handleDelete(room.id, room.roomNumber)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>
      )}

      {/* Room Form Dialog */}
      <RoomFormDialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditingRoom(null);
        }}
        roomId={editingRoom}
      />
    </Box>
  );
};
