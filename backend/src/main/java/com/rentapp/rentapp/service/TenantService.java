package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.TenantRequest;
import com.rentapp.rentapp.dto.TenantResponse;
import com.rentapp.rentapp.entity.Property;
import com.rentapp.rentapp.entity.Room;
import com.rentapp.rentapp.entity.Tenant;
import com.rentapp.rentapp.enums.TenantStatus;
import com.rentapp.rentapp.exception.ResourceNotFoundException;
import com.rentapp.rentapp.exception.RoomCapacityException;
import com.rentapp.rentapp.mapper.TenantMapper;
import com.rentapp.rentapp.repository.TenantRepository;
import com.rentapp.rentapp.security.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * TenantService - CORE BUSINESS LOGIC with strict security
 * 
 * Security Flow:
 * 1. Extract ownerId from JWT
 * 2. Validate property belongs to owner
 * 3. Validate room belongs to property (and owner)
 * 4. Then create/access tenant
 * 
 * CRITICAL: Must validate BOTH property AND room ownership!
 */
@Service
@RequiredArgsConstructor
public class TenantService {
    
    private final TenantRepository tenantRepository;
    private final TenantMapper tenantMapper;
    private final PropertyService propertyService;
    private final RoomService roomService;
    private final SecurityContextUtil securityContextUtil;
    
    /**
     * Create a new tenant
     * CRITICAL SECURITY: Validates property AND room ownership!
     * 
     * @param request Tenant details with propertyId and roomId
     * @return Created tenant
     * @throws RuntimeException if property/room not found or doesn't belong to owner
     */
    @Transactional
    public TenantResponse createTenant(TenantRequest request) {
        // SECURITY STEP 1: Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // SECURITY STEP 2: Validate property belongs to this owner
        // This prevents creating tenants under other owners' properties!
        Property property = propertyService.getPropertyEntity(request.getPropertyId(), ownerId);
        
        // SECURITY STEP 3: Validate room belongs to this owner
        // This prevents assigning tenant to other owners' rooms!
        Room room = roomService.getRoomEntity(request.getRoomId(), ownerId);
        
        // BUSINESS RULE STEP 4: Validate room belongs to the property
        // This ensures data integrity - can't assign room from different property
        if (!room.getProperty().getId().equals(property.getId())) {
            throw new RuntimeException("Room does not belong to the specified property");
        }
        
        // BUSINESS RULE STEP 5: Check room capacity before creating tenant
        // This is CRITICAL - never trust frontend validation
        if (room.isFull()) {
            throw new RoomCapacityException("Room is full. Cannot add more tenants. (Occupied: " + 
                room.getOccupiedCount() + "/" + room.getCapacity() + ")");
        }
        
        // SECURITY STEP 6: Create tenant only after all validations pass
        Tenant tenant = tenantMapper.toEntity(request);
        tenant.setProperty(property);
        tenant.setRoom(room);
        
        Tenant savedTenant = tenantRepository.save(tenant);
        
        // CRITICAL: Increment room occupied count using safe method
        room.incrementOccupied();
        
        return tenantMapper.toResponse(savedTenant);
    }
    
    /**
     * Get all tenants for the authenticated owner
     * SECURITY: Filters through property.owner.id
     */
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Query filters through property → owner relationship
        return tenantRepository.findByPropertyOwnerId(ownerId).stream()
                .map(tenantMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all tenants for the authenticated owner (PAGINATED)
     * SECURITY: Filters through property.owner.id
     */
    @Transactional(readOnly = true)
    public Page<TenantResponse> getAllTenantsPaginated(Pageable pageable) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Query filters through property → owner relationship
        return tenantRepository.findByPropertyOwnerId(ownerId, pageable)
                .map(tenantMapper::toResponse);
    }
    
    /**
     * Get all active tenants
     * SECURITY: Filters by ownerId and status
     */
    @Transactional(readOnly = true)
    public List<TenantResponse> getActiveTenants() {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        return tenantRepository.findByPropertyOwnerIdAndStatus(ownerId, TenantStatus.ACTIVE).stream()
                .map(tenantMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tenants for a specific property
     * SECURITY: Validates property ownership first
     */
    @Transactional(readOnly = true)
    public List<TenantResponse> getTenantsByProperty(Long propertyId) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Validate property ownership first
        propertyService.getPropertyEntity(propertyId, ownerId);
        
        // Then get tenants for that property
        return tenantRepository.findByPropertyIdAndPropertyOwnerId(propertyId, ownerId).stream()
                .map(tenantMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tenants for a specific room
     * SECURITY: Validates room ownership through property → owner
     */
    @Transactional(readOnly = true)
    public List<TenantResponse> getTenantsByRoom(Long roomId) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Validate room ownership
        roomService.getRoomEntity(roomId, ownerId);
        
        // Then get tenants for that room
        return tenantRepository.findByRoomIdAndPropertyOwnerId(roomId, ownerId).stream()
                .map(tenantMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific tenant by ID
     * SECURITY: Validates ownership through property → owner
     */
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long tenantId) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Find tenant only if it belongs to owner's property
        Tenant tenant = tenantRepository.findByIdAndPropertyOwnerId(tenantId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found or access denied"));
        
        return tenantMapper.toResponse(tenant);
    }
    
    /**
     * Update a tenant
     * SECURITY: Validates ownership before update
     */
    @Transactional
    public TenantResponse updateTenant(Long tenantId, TenantRequest request) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Find tenant with ownership validation
        Tenant tenant = tenantRepository.findByIdAndPropertyOwnerId(tenantId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found or access denied"));
        
        // Get old room for occupied count update
        Room oldRoom = tenant.getRoom();
        
        // If changing property or room, validate ownership
        boolean propertyChanged = !tenant.getProperty().getId().equals(request.getPropertyId());
        boolean roomChanged = !tenant.getRoom().getId().equals(request.getRoomId());
        
        if (propertyChanged) {
            Property newProperty = propertyService.getPropertyEntity(request.getPropertyId(), ownerId);
            tenant.setProperty(newProperty);
        }
        
        if (roomChanged) {
            Room newRoom = roomService.getRoomEntity(request.getRoomId(), ownerId);
            
            // Validate new room belongs to the property
            if (!newRoom.getProperty().getId().equals(tenant.getProperty().getId())) {
                throw new RuntimeException("Room does not belong to the specified property");
            }
            
            // Update occupied counts
            oldRoom.setOccupiedCount(oldRoom.getOccupiedCount() - 1);
            newRoom.setOccupiedCount(newRoom.getOccupiedCount() + 1);
            
            tenant.setRoom(newRoom);
        }
        
        tenantMapper.updateEntity(tenant, request);
        Tenant updatedTenant = tenantRepository.save(tenant);
        
        return tenantMapper.toResponse(updatedTenant);
    }
    
    /**
     * Update tenant status (e.g., mark as INACTIVE when they leave)
     * SECURITY: Validates ownership before status change
     */
    @Transactional
    public TenantResponse updateTenantStatus(Long tenantId, TenantStatus status) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        Tenant tenant = tenantRepository.findByIdAndPropertyOwnerId(tenantId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found or access denied"));
        
        TenantStatus oldStatus = tenant.getStatus();
        tenant.setStatus(status);
        
        // Update room occupied count when status changes
        if (oldStatus == TenantStatus.ACTIVE && status == TenantStatus.INACTIVE) {
            Room room = tenant.getRoom();
            room.setOccupiedCount(Math.max(0, room.getOccupiedCount() - 1));
        } else if (oldStatus == TenantStatus.INACTIVE && status == TenantStatus.ACTIVE) {
            Room room = tenant.getRoom();
            room.setOccupiedCount(room.getOccupiedCount() + 1);
        }
        
        return tenantMapper.toResponse(tenantRepository.save(tenant));
    }
    
    /**
     * Delete a tenant
     * SECURITY: Validates ownership before deletion
     */
    @Transactional
    public void deleteTenant(Long tenantId) {
        // Get ownerId from JWT (enforced)
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Find tenant with ownership validation
        Tenant tenant = tenantRepository.findByIdAndPropertyOwnerId(tenantId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found or access denied"));
        
        // CRITICAL: Decrement room occupied count before deletion
        // Only decrement if tenant was actually occupying a bed
        if (tenant.getStatus() == TenantStatus.ACTIVE) {
            Room room = tenant.getRoom();
            try {
                room.decrementOccupied();
            } catch (IllegalStateException e) {
                // Log warning but don't fail deletion
                System.err.println("Warning: Could not decrement occupied count: " + e.getMessage());
            }
        }
        
        tenantRepository.delete(tenant);
    }
    
    /**
     * Get tenant count for dashboard
     */
    @Transactional(readOnly = true)
    public Long countActiveTenants() {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        return tenantRepository.countByPropertyOwnerIdAndStatus(ownerId, TenantStatus.ACTIVE);
    }
    
    /**
     * Internal method to get Tenant entity (for Payment service)
     * SECURITY: Still validates ownership
     */
    @Transactional(readOnly = true)
    public Tenant getTenantEntity(Long tenantId, Long ownerId) {
        return tenantRepository.findByIdAndPropertyOwnerId(tenantId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found or access denied"));
    }
    
    /**
     * Get all active tenant entities (for bulk operations like monthly payment generation)
     * SECURITY: Filters by ownerId
     */
    @Transactional(readOnly = true)
    public List<Tenant> getAllActiveTenants(Long ownerId) {
        return tenantRepository.findByPropertyOwnerIdAndStatus(ownerId, TenantStatus.ACTIVE);
    }
}
