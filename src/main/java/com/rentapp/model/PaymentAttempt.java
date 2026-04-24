package com.rentapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * PaymentAttempt - Tracks all UTR submission attempts
 * Used for fraud detection and behavior analysis
 */
@Entity
@Table(name = "payment_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intent_id", nullable = false)
    private PaymentIntent paymentIntent;

    @Column(nullable = false)
    private String utrNumber;

    @Column(nullable = false)
    private Double submittedAmount;

    @Column(nullable = false)
    private LocalDateTime attemptedAt;

    @Column
    private String sessionId;

    @Column
    private String userAgent;

    @Column
    private String ipAddress;

    @Column(nullable = false)
    private String result;  // SUCCESS, REJECTED, SUSPICIOUS

    @Column
    private Integer confidenceScore;  // 0-100

    @Column(length = 1000)
    private String confidenceFactors;  // JSON of scoring reasons

    @Column(length = 500)
    private String rejectionReason;

    @PrePersist
    protected void onCreate() {
        attemptedAt = LocalDateTime.now();
    }
}
