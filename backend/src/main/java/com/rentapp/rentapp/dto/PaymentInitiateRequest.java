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
public class PaymentInitiateRequest {
    
    @NotNull(message = "Tenant ID is required")
    private Long tenantId;
    
    @NotBlank(message = "Month is required")
    private String month;  // Format: "2026-04" or "April 2026"
    
    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount cannot be negative")
    private Double amount;
}
