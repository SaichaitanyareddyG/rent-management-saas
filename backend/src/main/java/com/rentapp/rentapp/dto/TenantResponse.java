package com.rentapp.rentapp.dto;

import com.rentapp.rentapp.enums.TenantStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {
    
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String nativeAddress;
    private String companyOrCollege;
    private String emergencyContact;
    private String guardianName;
    private String aadharNumber;  // Will be masked in controller
    private Double rentAmount;
    private TenantStatus status;
    private LocalDate joiningDate;
    private Integer rentDueDay;
    private Double advanceAmount;
    private String notes;
    
    // Property details (denormalized for convenience)
    private Long propertyId;
    private String propertyName;
    
    // Room details (denormalized for convenience)
    private Long roomId;
    private String roomNumber;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
