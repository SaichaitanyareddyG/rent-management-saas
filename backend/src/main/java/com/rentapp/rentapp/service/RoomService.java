package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.RoomRequest;
import com.rentapp.rentapp.dto.RoomResponse;
import com.rentapp.rentapp.entity.Property;
import com.rentapp.rentapp.entity.Room;
import com.rentapp.rentapp.mapper.RoomMapper;
import com.rentapp.rentapp.repository.RoomRepository;
import com.rentapp.rentapp.security.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * RoomService - CRITICAL SECURITY: Validate property ownership before room operations
 * 
 * Security Flow:
 * 1. Extract ownerId from JWT
 * 2. Validate property belongs to owner
 * 3. Then create/access room
 * 
 * NEVER trust propertyId from request without validation!
 */
@Service
@RequiredArgsConstructor
public class RoomService {
    
    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;
    private final PropertyService propertyService;
    private final SecurityContextUtil securityContextUtil;
    
    /**
     * Create a new room under a property
     * CRITICAL SECURITY: Validates property ownership first!
     * 
     * @param request Room details with propertyId
     * @return Created room
     * @throws RuntimeException if property not found or doesn't belong to owner
     */
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        // SECURITY STEP 1: Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // SECURITY STEP 2: Validate property belongs to this owner
        // This prevents creating rooms under other owners' properties!
        Property property = propertyService.getPropertyEntity(request.getPropertyId(), ownerId);
        
        // SECURITY STEP 3: Create room only after ownership validation
        Room room = roomMapper.toEntity(request);
        room.setProperty(property);
        
        Room savedRoom = roomRepository.save(room);
        return roomMapper.toResponse(savedRoom);
    }
    
    /**
     * Get all rooms for the authenticated owner
     * SECURITY: Filters through property.owner.id
     */
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Query filters through property → owner relationship
        return roomRepository.findByPropertyOwnerId(ownerId).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get rooms for a specific property
     * SECURITY: Validates property ownership first
     */
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByProperty(Long propertyId) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Validate property ownership first
        propertyService.getPropertyEntity(propertyId, ownerId);
        
        // Then get rooms for that property
        return roomRepository.findByPropertyIdAndPropertyOwnerId(propertyId, ownerId).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific room by ID
     * SECURITY: Validates ownership through property → owner
     */
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long roomId) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Find room only if it belongs to owner's property
        Room room = roomRepository.findByIdAndPropertyOwnerId(roomId, ownerId)
                .orElseThrow(() -> new RuntimeException("Room not found or access denied"));
        
        return roomMapper.toResponse(room);
    }
    
    /**
     * Update a room
     * SECURITY: Validates ownership before update
     */
    @Transactional
    public RoomResponse updateRoom(Long roomId, RoomRequest request) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Find room with ownership validation
        Room room = roomRepository.findByIdAndPropertyOwnerId(roomId, ownerId)
                .orElseThrow(() -> new RuntimeException("Room not found or access denied"));
        
        // If changing property, validate new property ownership
        if (!room.getProperty().getId().equals(request.getPropertyId())) {
            Property newProperty = propertyService.getPropertyEntity(request.getPropertyId(), ownerId);
            room.setProperty(newProperty);
        }
        
        roomMapper.updateEntity(room, request);
        Room updatedRoom = roomRepository.save(room);
        
        return roomMapper.toResponse(updatedRoom);
    }
    
    /**
     * Delete a room
     * SECURITY: Validates ownership before deletion
     */
    @Transactional
    public void deleteRoom(Long roomId) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Find room with ownership validation
        Room room = roomRepository.findByIdAndPropertyOwnerId(roomId, ownerId)
                .orElseThrow(() -> new RuntimeException("Room not found or access denied"));
        
        roomRepository.delete(room);
    }
    
    /**
     * Internal method to get Room entity (for other services)
     * SECURITY: Still validates ownership
     */
    @Transactional(readOnly = true)
    public Room getRoomEntity(Long roomId, Long ownerId) {
        return roomRepository.findByIdAndPropertyOwnerId(roomId, ownerId)
                .orElseThrow(() -> new RuntimeException("Room not found or access denied"));
    }
}
