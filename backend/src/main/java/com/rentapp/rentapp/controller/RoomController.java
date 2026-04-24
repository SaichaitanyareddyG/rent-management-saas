package com.rentapp.rentapp.controller;

import com.rentapp.rentapp.dto.RoomRequest;
import com.rentapp.rentapp.dto.RoomResponse;
import com.rentapp.rentapp.service.RoomService;
import com.rentapp.rentapp.util.CsvExportUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RoomController - Owner-scoped endpoints
 * 
 * CRITICAL SECURITY RULES:
 * 1. Never expose entities directly - always use DTOs
 * 2. OwnerId automatically extracted from JWT via SecurityContext
 * 3. Service layer validates property ownership before room operations
 * 4. No findAll() without owner filtering
 * 5. All data filtered through property.owner.id relationship
 */
@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {
    
    private final RoomService roomService;
    private final CsvExportUtil csvExportUtil;
    
    /**
     * Create a new room under a property
     * SECURITY: Service validates property ownership before creating room
     * 
     * @param request RoomRequest DTO with validation (includes propertyId)
     * @return Created room with 201 status
     */
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        // OwnerId extracted inside service via SecurityContext
        // Property ownership validated before room creation
        RoomResponse response = roomService.createRoom(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Get all rooms for the authenticated owner
     * Automatically filtered by owner through property relationship
     * 
     * @return List of rooms across all owner's properties
     */
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        // OwnerId automatically extracted from JWT
        // Filters through property.owner.id relationship
        List<RoomResponse> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }
    
    /**
     * Get rooms for a specific property
     * SECURITY: Validates property ownership first
     * 
     * @param propertyId Property ID
     * @return List of rooms for that property
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByProperty(@PathVariable Long propertyId) {
        // Service validates property ownership before returning rooms
        List<RoomResponse> rooms = roomService.getRoomsByProperty(propertyId);
        return ResponseEntity.ok(rooms);
    }
    
    /**
     * Get a specific room by ID
     * Access denied if room doesn't belong to current owner's property
     * 
     * @param id Room ID
     * @return Room details if owned by current user
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        // OwnerId extracted from JWT - validates ownership
        RoomResponse room = roomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }
    
    /**
     * Update a room
     * Only allowed if room belongs to current owner's property
     * 
     * @param id Room ID
     * @param request Updated room data
     * @return Updated room
     */
    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request) {
        // OwnerId extracted from JWT - validates ownership before update
        RoomResponse updated = roomService.updateRoom(id, request);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete a room
     * Only allowed if room belongs to current owner's property
     * 
     * @param id Room ID
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        // OwnerId extracted from JWT - validates ownership before deletion
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Export all rooms to CSV
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportRooms() {
        List<RoomResponse> rooms = roomService.getAllRooms();
        byte[] csvData = csvExportUtil.exportRoomsToCsv(rooms);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "rooms.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
