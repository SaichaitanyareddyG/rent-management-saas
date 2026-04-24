package com.rentapp.rentapp.mapper;

import com.rentapp.rentapp.dto.PropertyRequest;
import com.rentapp.rentapp.dto.PropertyResponse;
import com.rentapp.rentapp.entity.Property;
import org.springframework.stereotype.Component;

@Component
public class PropertyMapper {
    
    public Property toEntity(PropertyRequest request) {
        Property property = new Property();
        property.setName(request.getName());
        property.setAddressLine1(request.getAddressLine1());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPincode(request.getPincode());
        property.setUpiId(request.getUpiId());
        property.setDefaultRentDueDay(request.getDefaultRentDueDay() != null ? request.getDefaultRentDueDay() : 5);
        return property;
    }
    
    public PropertyResponse toResponse(Property property) {
        // Calculate stats from rooms
        int totalRooms = property.getRooms() != null ? property.getRooms().size() : 0;
        int totalBeds = property.getRooms() != null ? 
            property.getRooms().stream().mapToInt(room -> room.getCapacity()).sum() : 0;
        int occupiedBeds = property.getRooms() != null ? 
            property.getRooms().stream().mapToInt(room -> room.getOccupiedCount()).sum() : 0;
        
        return new PropertyResponse(
            property.getId(),
            property.getName(),
            property.getAddressLine1(),
            property.getCity(),
            property.getState(),
            property.getPincode(),
            property.getUpiId(),
            property.getDefaultRentDueDay(),
            property.getOwner().getId(),
            property.getOwner().getName(),
            property.getCreatedAt(),
            property.getUpdatedAt(),
            totalRooms,
            totalBeds,
            occupiedBeds
        );
    }
    
    public void updateEntity(Property property, PropertyRequest request) {
        property.setName(request.getName());
        if (request.getAddressLine1() != null) {
            property.setAddressLine1(request.getAddressLine1());
        }
        if (request.getCity() != null) {
            property.setCity(request.getCity());
        }
        if (request.getState() != null) {
            property.setState(request.getState());
        }
        if (request.getPincode() != null) {
            property.setPincode(request.getPincode());
        }
        property.setUpiId(request.getUpiId());
        if (request.getDefaultRentDueDay() != null) {
            property.setDefaultRentDueDay(request.getDefaultRentDueDay());
        }
    }
}
