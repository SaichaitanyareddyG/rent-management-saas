package com.rentapp.rentapp.repository;

import com.rentapp.rentapp.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * RoomRepository - CRITICAL: All queries filter through property.owner.id
 * 
 * Security Pattern: Room → Property → Owner
 * We validate ownership at the Property level
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    /**
     * Find all rooms belonging to properties owned by this owner
     * SECURITY: Filters through property.owner relationship
     */
    List<Room> findByPropertyOwnerId(Long ownerId);
    
    /**
     * Find room by ID only if it belongs to a property owned by this owner
     * SECURITY: Double validation - ID match + owner match
     */
    Optional<Room> findByIdAndPropertyOwnerId(Long id, Long ownerId);
    
    /**
     * Find all rooms for a specific property (with owner validation)
     * SECURITY: Filters by property ID AND owner ID
     */
    List<Room> findByPropertyIdAndPropertyOwnerId(Long propertyId, Long ownerId);
}
