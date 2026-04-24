package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.PropertyRequest;
import com.rentapp.rentapp.dto.PropertyResponse;
import com.rentapp.rentapp.entity.Owner;
import com.rentapp.rentapp.entity.Property;
import com.rentapp.rentapp.mapper.PropertyMapper;
import com.rentapp.rentapp.repository.PropertyRepository;
import com.rentapp.rentapp.security.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {
    
    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;
    private final SecurityContextUtil securityContextUtil;
    
    /**
     * Create a new property for the currently authenticated owner
     * CRITICAL: Always filters by ownerId from JWT - No data leakage
     */
    @Transactional
    public PropertyResponse createProperty(PropertyRequest request) {
        // Get owner from JWT token (enforced)
        Owner currentOwner = securityContextUtil.getCurrentOwner();
        
        Property property = propertyMapper.toEntity(request);
        property.setOwner(currentOwner);
        
        Property savedProperty = propertyRepository.save(property);
        return propertyMapper.toResponse(savedProperty);
    }
    
    /**
     * Get all properties for the currently authenticated owner
     * CRITICAL: Owner-scoped query - returns only owner's data
     */
    @Transactional(readOnly = true)
    public List<PropertyResponse> getAllProperties() {
        // Get ownerId from JWT token (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        return propertyRepository.findByOwnerId(ownerId).stream()
                .map(propertyMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific property by ID (only if it belongs to current owner)
     * CRITICAL: Owner-scoped query prevents unauthorized access
     */
    @Transactional(readOnly = true)
    public PropertyResponse getPropertyById(Long propertyId) {
        // Get ownerId from JWT token (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
                .orElseThrow(() -> new RuntimeException("Property not found or access denied"));
        
        return propertyMapper.toResponse(property);
    }
    
    /**
     * Update a property (only if it belongs to current owner)
     * CRITICAL: Validates ownership before update
     */
    @Transactional
    public PropertyResponse updateProperty(Long propertyId, PropertyRequest request) {
        // Get ownerId from JWT token (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
                .orElseThrow(() -> new RuntimeException("Property not found or access denied"));
        
        propertyMapper.updateEntity(property, request);
        Property updatedProperty = propertyRepository.save(property);
        
        return propertyMapper.toResponse(updatedProperty);
    }
    
    /**
     * Delete a property (only if it belongs to current owner)
     * CRITICAL: Validates ownership before deletion
     */
    @Transactional
    public void deleteProperty(Long propertyId) {
        // Get ownerId from JWT token (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
                .orElseThrow(() -> new RuntimeException("Property not found or access denied"));
        
        propertyRepository.delete(property);
    }
    
    /**
     * Internal method to get Property entity (for other services)
     * CRITICAL: Still validates ownership
     */
    @Transactional(readOnly = true)
    public Property getPropertyEntity(Long propertyId, Long ownerId) {
        return propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
                .orElseThrow(() -> new RuntimeException("Property not found or access denied"));
    }
}
