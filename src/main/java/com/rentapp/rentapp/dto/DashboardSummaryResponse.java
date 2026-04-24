package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DashboardSummaryResponse - Complete overview for owner dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    
    // Property metrics
    private Long totalProperties;
    private Long totalRooms;
    private Long occupiedRooms;
    private Double occupancyRate;  // Percentage
    
    // Tenant metrics
    private Long totalTenants;
    private Long activeTenants;
    private Long inactiveTenants;
    
    // Financial metrics
    private Double totalRevenue;  // All-time paid amount
    private Double monthlyRevenue;  // Current month paid
    private Double expectedMonthlyRevenue;  // Total rent from active tenants
    
    // Payment metrics
    private Long totalPayments;
    private Long paidPayments;
    private Long pendingPayments;
    private Long verifyPayments;
    
    // Current month
    private String currentMonth;
}
