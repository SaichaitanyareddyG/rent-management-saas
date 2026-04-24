package com.rentapp.rentapp.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantRequest {
    
    @NotBlank(message = "Tenant name is required")
    private String name;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Size(max = 500, message = "Native address cannot exceed 500 characters")
    private String nativeAddress;
    
    @Size(max = 200, message = "Company/College name cannot exceed 200 characters")
    private String companyOrCollege;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Emergency contact must be 10 digits")
    private String emergencyContact;
    
    @Size(max = 100, message = "Guardian name cannot exceed 100 characters")
    private String guardianName;
    
    @Pattern(regexp = "^[0-9]{12}$", message = "Aadhar number must be 12 digits")
    private String aadharNumber;
    
    @NotNull(message = "Rent amount is required")
    @Min(value = 0, message = "Rent amount cannot be negative")
    private Double rentAmount;
    
    @NotNull(message = "Property ID is required")
    private Long propertyId;
    
    @NotNull(message = "Room ID is required")
    private Long roomId;
    
    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;
    
    @NotNull(message = "Rent due day is required")
    @Min(value = 1, message = "Rent due day must be between 1 and 31")
    @Max(value = 31, message = "Rent due day must be between 1 and 31")
    private Integer rentDueDay;
    
    @Min(value = 0, message = "Advance amount cannot be negative")
    private Double advanceAmount = 0.0;
    
    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}
