package com.rentapp.rentapp.entity;

import com.rentapp.rentapp.enums.PaymentIntentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PaymentIntent - Tracks payment sessions with unique amounts for verification
 * 
 * Purpose:
 * - User clicks "Pay Rent" → PaymentIntent created with unique amount (base + 1-10)
 * - User sees unique amount to pay (e.g., ₹5,003 instead of ₹5,000)
 * - User submits UTR → System matches unique amount → High confidence verification
 * 
 * Benefits:
 * - Unique amount makes payment attribution certain
 * - Prevents duplicate payments (one active intent per tenant)
 * - Enables multi-signal fraud scoring
 * - Session binding prevents session hijacking
 */
@Entity
@Table(name = "payment_intents", indexes = {
    @Index(name = "idx_intent_token", columnList = "intentToken", unique = true),
    @Index(name = "idx_intent_tenant_status", columnList = "tenant_id, status"),
    @Index(name = "idx_intent_expires", columnList = "expiresAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String intentToken;  // UUID for secure session identification
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;
    
    // Legacy fields for backward compatibility with PaymentService (READ-ONLY)
    @Column(name = "tenant_id", insertable = false, updatable = false)
    private Long tenantId;  // Deprecated: use tenant.getId() instead
    
    @Column(insertable = false, updatable = false)
    private Double amount;  // Deprecated: use baseAmount instead
    
    @Column
    private String month;  // Legacy: month for which payment is made
    
    @Column
    private LocalDateTime completedAt;  // Legacy: when UTR was submitted
    
    // New verification system fields
    @Column(nullable = false)
    private Double baseAmount;  // Original rent amount (e.g., 5000)
    
    @Column(nullable = false)
    private Double uniqueAmount;  // Base + offset (e.g., 5003)
    
    @Column(nullable = false)
    private Integer amountOffset;  // 1-10 rupees added for uniqueness
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;  // 10 minutes from creation
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentIntentStatus status = PaymentIntentStatus.ACTIVE;
    
    @Column
    private String sessionId;  // HTTP session binding
    
    @Column(length = 1000)
    private String userAgent;  // Browser fingerprint
    
    @Column
    private String ipAddress;  // IP address for fraud detection
    
    @Column(nullable = false)
    private Integer attemptCount = 0;  // Number of UTR submission attempts
    
    @Column
    private LocalDateTime lastAttemptAt;  // Last UTR submission timestamp
    
    @Column
    private Long paymentId;  // Linked payment after successful verification
    
    /**
     * Check if intent is still active and valid
     */
    public boolean isActive() {
        return status == PaymentIntentStatus.ACTIVE && 
               expiresAt != null && 
               expiresAt.isAfter(LocalDateTime.now());
    }
}
