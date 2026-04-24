package com.rentapp.rentapp.entity;

import com.rentapp.rentapp.enums.PaymentIntentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * PaymentIntent - Tracks payment initiation before confirmation
 * 
 * Purpose:
 * - User clicks "Pay Rent" → PaymentIntent created with status INITIATED
 * - User submits UTR → PaymentIntent matched → Payment created with status VERIFY
 * - Admin verifies → Payment status changes to PAID
 * 
 * Benefits:
 * - Prevents duplicate payments (check if intent exists)
 * - Tracks abandoned payments (INITIATED but never confirmed)
 * - Links payment to original request
 */
@Entity
@Table(name = "payment_intents", indexes = {
    @Index(name = "idx_intent_tenant", columnList = "tenant_id"),
    @Index(name = "idx_intent_status", columnList = "status"),
    @Index(name = "idx_intent_month", columnList = "month")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long tenantId;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private String month;  // Month for which payment is being made
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentIntentStatus status = PaymentIntentStatus.INITIATED;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime completedAt;  // When UTR was submitted
}
