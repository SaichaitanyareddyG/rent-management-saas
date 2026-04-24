package com.rentapp.rentapp.controller;

import com.rentapp.rentapp.dto.PropertyRequest;
import com.rentapp.rentapp.dto.PropertyResponse;
import com.rentapp.rentapp.service.PropertyService;
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
 * Property Controller - Owner-scoped endpoints
 * 
 * CRITICAL SECURITY RULES:
 * 1. Never expose entities directly - always use DTOs
 * 2. Always extract ownerId from JWT via SecurityContext
 * 3. Never trust frontend - always validate ownership in service layer
 * 4. No findAll() without owner filtering
 */
@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
public class PropertyController {
    
    private final PropertyService propertyService;
    private final CsvExportUtil csvExportUtil;
    
    /**
     * Create a new property
     * Owner is automatically extracted from JWT and assigned
     * 
     * @param request PropertyRequest DTO with validation
     * @return Created property with 201 status
     */
    @PostMapping
    public ResponseEntity<PropertyResponse> createProperty(@Valid @RequestBody PropertyRequest request) {
        // OwnerId is extracted inside service via SecurityContext
        // No need to pass it explicitly - enforced by JWT filter
        PropertyResponse response = propertyService.createProperty(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Get all properties for the authenticated owner
     * Automatically filtered by ownerId from JWT
     * 
     * @return List of properties owned by current user
     */
    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllProperties() {
        // OwnerId automatically extracted from JWT
        // Only returns properties owned by authenticated user
        List<PropertyResponse> properties = propertyService.getAllProperties();
        return ResponseEntity.ok(properties);
    }
    
    /**
     * Get a specific property by ID
     * Access denied if property doesn't belong to current owner
     * 
     * @param id Property ID
     * @return Property details if owned by current user
     */
    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(@PathVariable Long id) {
        // OwnerId extracted from JWT - validates ownership
        PropertyResponse property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(property);
    }
    
    /**
     * Update a property
     * Only allowed if property belongs to current owner
     * 
     * @param id Property ID
     * @param request Updated property data
     * @return Updated property
     */
    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request) {
        // OwnerId extracted from JWT - validates ownership before update
        PropertyResponse updated = propertyService.updateProperty(id, request);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete a property
     * Only allowed if property belongs to current owner
     * 
     * @param id Property ID
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        // OwnerId extracted from JWT - validates ownership before deletion
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Export all properties to CSV
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportProperties() {
        List<PropertyResponse> properties = propertyService.getAllProperties();
        byte[] csvData = csvExportUtil.exportPropertiesToCsv(properties);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "properties.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
