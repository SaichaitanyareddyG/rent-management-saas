package com.rentapp.rentapp.repository;

import com.rentapp.rentapp.entity.Tenant;
import com.rentapp.rentapp.enums.TenantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TenantRepository - CRITICAL: All queries filter through property.owner.id
 * 
 * Security Pattern: Tenant → Property → Owner
 * We validate ownership at the Property level
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    
    /**
     * Find all tenants belonging to properties owned by this owner
     * SECURITY: Filters through property.owner relationship
     */
    List<Tenant> findByPropertyOwnerId(Long ownerId);
    
    /**
     * Find all tenants belonging to properties owned by this owner (PAGINATED)
     * SECURITY: Filters through property.owner relationship
     */
    Page<Tenant> findByPropertyOwnerId(Long ownerId, Pageable pageable);
    
    /**
     * Find tenant by ID only if it belongs to a property owned by this owner
     * SECURITY: Double validation - ID match + owner match
     */
    Optional<Tenant> findByIdAndPropertyOwnerId(Long id, Long ownerId);
    
    /**
     * Find all tenants for a specific property (with owner validation)
     * SECURITY: Filters by property ID AND owner ID
     */
    List<Tenant> findByPropertyIdAndPropertyOwnerId(Long propertyId, Long ownerId);
    
    /**
     * Find all tenants in a specific room (with owner validation)
     * SECURITY: Filters through room → property → owner chain
     */
    List<Tenant> findByRoomIdAndPropertyOwnerId(Long roomId, Long ownerId);
    
    /**
     * Find active tenants for an owner
     * Useful for dashboard showing current occupancy
     */
    List<Tenant> findByPropertyOwnerIdAndStatus(Long ownerId, TenantStatus status);
    
    /**
     * Find tenants by property and status
     * Useful for property-specific occupancy reports
     */
    List<Tenant> findByPropertyIdAndPropertyOwnerIdAndStatus(Long propertyId, Long ownerId, TenantStatus status);
    
    /**
     * Count active tenants for an owner
     * Dashboard metric
     */
    Long countByPropertyOwnerIdAndStatus(Long ownerId, TenantStatus status);
    
    /**
     * Find tenant by phone number (PUBLIC - no owner validation)
     * Used for public payment portal where tenant looks up by phone
     * Returns first match (should be unique in real scenario)
     */
    Optional<Tenant> findByPhone(String phone);
}
