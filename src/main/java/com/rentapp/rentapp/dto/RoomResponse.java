package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    
    private Long id;
    private String roomNumber;
    private Integer capacity;
    private Integer occupiedCount;
    private Integer availableBeds;  // Computed: capacity - occupiedCount
    private Long propertyId;
    private String propertyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
