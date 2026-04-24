package com.rentapp.rentapp.dto;

import com.rentapp.rentapp.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    
    private Long id;
    private Double amount;
    private String month;
    private PaymentStatus status;
    private String utr;
    private String notes;
    
    // Tenant details (denormalized)
    private Long tenantId;
    private String tenantName;
    
    // Property details (denormalized)
    private Long propertyId;
    private String propertyName;
    
    // Room details (denormalized)
    private Long roomId;
    private String roomNumber;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
}
