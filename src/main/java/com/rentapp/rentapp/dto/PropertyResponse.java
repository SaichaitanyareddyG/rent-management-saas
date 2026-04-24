package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    
    private Long id;
    private String name;
    private String addressLine1;
    private String city;
    private String state;
    private String pincode;
    private String upiId;
    private Integer defaultRentDueDay;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed fields for dashboard
    private Integer totalRooms;
    private Integer totalBeds;
    private Integer occupiedBeds;
}
