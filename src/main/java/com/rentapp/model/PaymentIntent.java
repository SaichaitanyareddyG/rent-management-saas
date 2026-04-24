package com.rentapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * PaymentIntent - Intent-based payment tracking
 * Ensures unique, time-bound payment sessions with fraud prevention
 */
@Entity
@Table(name = "payment_intents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String intentToken;  // UUID - binds payment to this session

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private Double baseAmount;  // Original rent amount

    @Column(nullable = false)
    private Double uniqueAmount;  // Amount with unique offset (₹5001, ₹5002, etc.)

    @Column(nullable = false)
    private Integer amountOffset;  // 1-10 rupee offset for uniqueness

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;  // 10-minute expiry

    @Column(nullable = false)
    private String status;  // ACTIVE, EXPIRED, USED, CANCELLED

    @Column
    private String sessionId;  // Browser session binding

    @Column
    private String userAgent;  // Device fingerprint

    @Column
    private String ipAddress;  // Request IP

    @Column
    private Integer attemptCount = 0;  // Track submission attempts

    @Column
    private LocalDateTime lastAttemptAt;

    @Column
    private Long paymentId;  // Linked payment after successful verification

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isActive() {
        return "ACTIVE".equals(status) && !isExpired();
    }
}
