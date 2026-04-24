package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RevenueResponse - Monthly revenue breakdown
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueResponse {
    
    private String month;
    private Double paidAmount;
    private Double pendingAmount;
    private Double expectedAmount;
    private Long paidCount;
    private Long pendingCount;
    private Double collectionRate;  // Percentage of paid vs expected
}
