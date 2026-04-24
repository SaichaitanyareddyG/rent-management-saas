package com.rentapp.rentapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyRequest {
    
    @NotBlank(message = "Property name is required")
    private String name;
    
    private String addressLine1;
    
    private String city;
    
    private String state;
    
    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
    private String pincode;
    
    @NotBlank(message = "UPI ID is required")
    private String upiId;
    
    @Min(value = 1, message = "Rent due day must be between 1 and 31")
    @Max(value = 31, message = "Rent due day must be between 1 and 31")
    private Integer defaultRentDueDay = 5;
}
