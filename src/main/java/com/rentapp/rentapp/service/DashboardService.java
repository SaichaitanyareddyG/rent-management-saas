package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.DashboardSummaryResponse;
import com.rentapp.rentapp.dto.PaymentStatsResponse;
import com.rentapp.rentapp.dto.RevenueResponse;
import com.rentapp.rentapp.enums.PaymentStatus;
import com.rentapp.rentapp.enums.TenantStatus;
import com.rentapp.rentapp.repository.*;
import com.rentapp.rentapp.security.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

/**
 * DashboardService - Aggregated analytics for owner dashboard
 * 
 * Provides:
 * - Summary statistics
 * - Revenue calculations
 * - Payment analytics
 * - Occupancy metrics
 * 
 * All queries filtered by ownerId for security
 */
@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final PaymentRepository paymentRepository;
    private final SecurityContextUtil securityContextUtil;
    
    /**
     * Get complete dashboard summary
     * Single API call with all key metrics
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        String currentMonth = getCurrentMonth();
        
        DashboardSummaryResponse summary = new DashboardSummaryResponse();
        
        // Property metrics
        summary.setTotalProperties(getTotalProperties(ownerId));
        summary.setTotalRooms(getTotalRooms(ownerId));
        summary.setOccupiedRooms(getOccupiedRooms(ownerId));
        
        // Calculate occupancy rate
        Long totalRooms = summary.getTotalRooms();
        if (totalRooms > 0) {
            double occupancyRate = (summary.getOccupiedRooms() * 100.0) / totalRooms;
            summary.setOccupancyRate(Math.round(occupancyRate * 100.0) / 100.0);
        } else {
            summary.setOccupancyRate(0.0);
        }
        
        // Tenant metrics
        summary.setTotalTenants(getTotalTenants(ownerId));
        summary.setActiveTenants(tenantRepository.countByPropertyOwnerIdAndStatus(ownerId, TenantStatus.ACTIVE));
        summary.setInactiveTenants(summary.getTotalTenants() - summary.getActiveTenants());
        
        // Financial metrics
        summary.setTotalRevenue(getTotalRevenue(ownerId));
        summary.setMonthlyRevenue(getMonthlyRevenue(currentMonth, ownerId));
        summary.setExpectedMonthlyRevenue(getExpectedMonthlyRevenue(ownerId));
        
        // Payment metrics
        summary.setTotalPayments(paymentRepository.count());
        summary.setPaidPayments(paymentRepository.countByStatusAndTenantPropertyOwnerId(PaymentStatus.PAID, ownerId));
        summary.setPendingPayments(paymentRepository.countByStatusAndTenantPropertyOwnerId(PaymentStatus.PENDING, ownerId));
        summary.setVerifyPayments(paymentRepository.countByStatusAndTenantPropertyOwnerId(PaymentStatus.VERIFY, ownerId));
        
        summary.setCurrentMonth(currentMonth);
        
        return summary;
    }
    
    /**
     * Get revenue breakdown for a specific month
     */
    @Transactional(readOnly = true)
    public RevenueResponse getRevenueForMonth(String month) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        RevenueResponse revenue = new RevenueResponse();
        revenue.setMonth(month);
        
        // Paid amount
        Double paidAmount = paymentRepository.sumPaidAmountByMonthAndOwnerId(month, ownerId);
        revenue.setPaidAmount(paidAmount != null ? paidAmount : 0.0);
        
        // Paid count
        revenue.setPaidCount(paymentRepository.countByStatusAndTenantPropertyOwnerId(PaymentStatus.PAID, ownerId));
        
        // Pending count
        revenue.setPendingCount(paymentRepository.countByStatusAndTenantPropertyOwnerId(PaymentStatus.PENDING, ownerId));
        
        // Expected amount (sum of all active tenant rents)
        Double expectedAmount = getExpectedMonthlyRevenue(ownerId);
        revenue.setExpectedAmount(expectedAmount);
        
        // Pending amount (expected - paid)
        revenue.setPendingAmount(expectedAmount - revenue.getPaidAmount());
        
        // Collection rate (percentage)
        if (expectedAmount > 0) {
            double collectionRate = (revenue.getPaidAmount() * 100.0) / expectedAmount;
            revenue.setCollectionRate(Math.round(collectionRate * 100.0) / 100.0);
        } else {
            revenue.setCollectionRate(0.0);
        }
        
        return revenue;
    }
    
    /**
     * Get payment statistics for a month
     */
    @Transactional(readOnly = true)
    public PaymentStatsResponse getPaymentStats(String month) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        PaymentStatsResponse stats = new PaymentStatsResponse();
        stats.setMonth(month);
        
        // Get counts by status
        Long paidCount = paymentRepository.countByStatusAndTenantPropertyOwnerId(PaymentStatus.PAID, ownerId);
        Long pendingCount = paymentRepository.countByStatusAndTenantPropertyOwnerId(PaymentStatus.PENDING, ownerId);
        Long verifyCount = paymentRepository.countByStatusAndTenantPropertyOwnerId(PaymentStatus.VERIFY, ownerId);
        
        stats.setPaidPayments(paidCount);
        stats.setPendingPayments(pendingCount);
        stats.setVerifyPayments(verifyCount);
        
        Long total = paidCount + pendingCount + verifyCount;
        stats.setTotalPayments(total);
        
        // Calculate percentages
        if (total > 0) {
            stats.setPaidPercentage(Math.round((paidCount * 100.0 / total) * 100.0) / 100.0);
            stats.setPendingPercentage(Math.round((pendingCount * 100.0 / total) * 100.0) / 100.0);
            stats.setVerifyPercentage(Math.round((verifyCount * 100.0 / total) * 100.0) / 100.0);
        } else {
            stats.setPaidPercentage(0.0);
            stats.setPendingPercentage(0.0);
            stats.setVerifyPercentage(0.0);
        }
        
        return stats;
    }
    
    /**
     * Helper: Get total properties for owner
     */
    private Long getTotalProperties(Long ownerId) {
        return (long) propertyRepository.findByOwnerId(ownerId).size();
    }
    
    /**
     * Helper: Get total rooms for owner
     */
    private Long getTotalRooms(Long ownerId) {
        return (long) roomRepository.findByPropertyOwnerId(ownerId).size();
    }
    
    /**
     * Helper: Get occupied rooms count
     */
    private Long getOccupiedRooms(Long ownerId) {
        return roomRepository.findByPropertyOwnerId(ownerId).stream()
                .filter(room -> room.getOccupiedCount() > 0)
                .count();
    }
    
    /**
     * Helper: Get total tenants for owner
     */
    private Long getTotalTenants(Long ownerId) {
        return (long) tenantRepository.findByPropertyOwnerId(ownerId).size();
    }
    
    /**
     * Helper: Get total revenue (all-time paid)
     */
    private Double getTotalRevenue(Long ownerId) {
        Double revenue = paymentRepository.sumPaidAmountByOwnerId(ownerId);
        return revenue != null ? revenue : 0.0;
    }
    
    /**
     * Helper: Get monthly revenue (current month paid)
     */
    private Double getMonthlyRevenue(String month, Long ownerId) {
        Double revenue = paymentRepository.sumPaidAmountByMonthAndOwnerId(month, ownerId);
        return revenue != null ? revenue : 0.0;
    }
    
    /**
     * Helper: Get expected monthly revenue (sum of active tenant rents)
     */
    private Double getExpectedMonthlyRevenue(Long ownerId) {
        return tenantRepository.findByPropertyOwnerIdAndStatus(ownerId, TenantStatus.ACTIVE).stream()
                .mapToDouble(tenant -> tenant.getRentAmount())
                .sum();
    }
    
    /**
     * Helper: Get current month in standard format
     */
    private String getCurrentMonth() {
        return YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }
}
