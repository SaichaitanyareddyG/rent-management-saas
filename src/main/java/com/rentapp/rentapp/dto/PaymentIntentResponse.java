package com.rentapp.rentapp.dto;

import com.rentapp.rentapp.enums.PaymentIntentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentResponse {
    
    private Long id;
    private Long tenantId;
    private String tenantName;
    private Double amount;
    private String month;
    private PaymentIntentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
