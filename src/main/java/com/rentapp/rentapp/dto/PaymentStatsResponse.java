package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PaymentStatsResponse - Payment statistics for a period
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatsResponse {
    
    private String month;
    private Long totalPayments;
    private Long paidPayments;
    private Long pendingPayments;
    private Long verifyPayments;
    private Double paidPercentage;
    private Double pendingPercentage;
    private Double verifyPercentage;
}
