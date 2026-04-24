package com.rentapp.rentapp.repository;

import com.rentapp.rentapp.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    
    List<Property> findByOwnerId(Long ownerId);
    
    Optional<Property> findByIdAndOwnerId(Long id, Long ownerId);
}
