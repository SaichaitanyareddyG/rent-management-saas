package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for payment session creation
 * Contains intent token and unique payment amount for verification
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSessionResponse {
    private String intentToken;
    private Long tenantId;
    private String tenantName;
    private Double baseAmount;
    private Double uniqueAmount;
    private Integer amountOffset;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Integer validityMinutes;
    private String upiId;
    private String ownerName;
    private String propertyName;
    private String roomNumber;
    private String currentMonth;
}
