package com.rentapp.rentapp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.rentapp.rentapp.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Payment Entity - Tracks rent payments with UPI verification
 * 
 * Security: Payment → Tenant → Property → Owner
 * Status Flow: PENDING → VERIFY → PAID
 */
@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payment_tenant", columnList = "tenant_id"),
    @Index(name = "idx_payment_status", columnList = "status"),
    @Index(name = "idx_payment_month", columnList = "month"),
    @Index(name = "idx_payment_tenant_month", columnList = "tenant_id, month")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "tenant")
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private String month;  // Format: "2026-04" or "April 2026"
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @Column
    private String utr;  // UPI Transaction Reference
    
    @Column(length = 500)
    private String notes;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column
    private LocalDateTime paidAt;  // When payment was marked as PAID
    
    /**
     * CRITICAL: Payment belongs to Tenant
     * Security validation through tenant.property.owner.id
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonBackReference
    private Tenant tenant;
}
