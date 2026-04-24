package com.rentapp.rentapp.controller;

import com.rentapp.rentapp.dto.DashboardSummaryResponse;
import com.rentapp.rentapp.dto.PaymentStatsResponse;
import com.rentapp.rentapp.dto.RevenueResponse;
import com.rentapp.rentapp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * DashboardController - Analytics and summary endpoints
 * 
 * Provides aggregated data for admin dashboard:
 * - Summary statistics
 * - Revenue breakdowns
 * - Payment analytics
 * - Occupancy metrics
 * 
 * All data automatically filtered by ownerId from JWT
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    /**
     * Get complete dashboard summary
     * Single endpoint with all key metrics
     * 
     * Includes:
     * - Property/room/tenant counts
     * - Occupancy rate
     * - Revenue metrics (total, monthly, expected)
     * - Payment status counts
     * 
     * @return Complete dashboard summary
     */
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        // OwnerId automatically extracted from JWT
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Get revenue breakdown for a specific month
     * 
     * Returns:
     * - Paid amount
     * - Pending amount
     * - Expected amount
     * - Collection rate
     * 
     * @param month Month in format "2026-04" or "April 2026"
     * @return Revenue breakdown
     */
    @GetMapping("/revenue")
    public ResponseEntity<RevenueResponse> getRevenue(
            @RequestParam(defaultValue = "") String month) {
        
        // If month not provided, use current month
        if (month.isEmpty()) {
            month = java.time.YearMonth.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        
        RevenueResponse revenue = dashboardService.getRevenueForMonth(month);
        return ResponseEntity.ok(revenue);
    }
    
    /**
     * Get payment statistics for a month
     * 
     * Returns:
     * - Total payments
     * - Paid/pending/verify counts
     * - Percentage breakdown
     * 
     * @param month Month in format "2026-04"
     * @return Payment statistics
     */
    @GetMapping("/payment-stats")
    public ResponseEntity<PaymentStatsResponse> getPaymentStats(
            @RequestParam(defaultValue = "") String month) {
        
        // If month not provided, use current month
        if (month.isEmpty()) {
            month = java.time.YearMonth.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        
        PaymentStatsResponse stats = dashboardService.getPaymentStats(month);
        return ResponseEntity.ok(stats);
    }
}
