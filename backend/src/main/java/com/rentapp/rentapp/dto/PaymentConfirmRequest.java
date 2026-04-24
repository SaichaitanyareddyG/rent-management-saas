package com.rentapp.rentapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequest {
    
    @NotNull(message = "Tenant ID is required")
    private Long tenantId;
    
    @NotBlank(message = "Month is required")
    private String month;
    
    @NotBlank(message = "UTR is required")
    private String utr;  // UPI Transaction Reference
    
    private String notes;
}
