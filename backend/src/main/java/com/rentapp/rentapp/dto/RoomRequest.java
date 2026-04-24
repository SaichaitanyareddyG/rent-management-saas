package com.rentapp.rentapp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    
    @NotBlank(message = "Room number is required")
    private String roomNumber;
    
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    @NotNull(message = "Property ID is required")
    private Long propertyId;
    
    @Min(value = 0, message = "Occupied count cannot be negative")
    private Integer occupiedCount = 0;
}
