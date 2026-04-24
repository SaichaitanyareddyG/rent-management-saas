package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Public Tenant Details Response - LIMITED INFO ONLY
 * Used for public payment portal (no authentication)
 * 
 * ❌ Don't expose: Aadhaar, phone, email, guardian, address
 * ✅ Expose only: name, room, rent, property name, UPI ID
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicTenantDetailsResponse {
    
    private Long tenantId;
    private String name;
    private String roomNumber;
    private String propertyName;
    private Double rentAmount;
    private String currentMonth;  // Format: "2026-04"
    private String upiId;  // Property owner's UPI ID for payment
    private String ownerName;  // Property owner's name for UPI pn parameter
    
    // Payment status check
    private boolean alreadyPaidThisMonth;
    private String paymentStatus;  // PAID, PENDING, VERIFY, OVERDUE
}
