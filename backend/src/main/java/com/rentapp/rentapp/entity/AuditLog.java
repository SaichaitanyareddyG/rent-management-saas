package com.rentapp.rentapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * AuditLog Entity - Stores user action logs in database
 * Useful for compliance, security audits, and debugging
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_owner", columnList = "ownerId"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String requestId;
    
    @Column
    private Long ownerId;
    
    @Column
    private String userEmail;
    
    @Column(nullable = false)
    private String action;
    
    @Column(nullable = false)
    private String httpMethod;
    
    @Column(nullable = false)
    private String endpoint;
    
    @Column(length = 2000)
    private String requestData;
    
    @Column
    private String ipAddress;
    
    @Column
    private String userAgent;
    
    @Column
    private Integer responseStatus;
    
    @Column
    private Long executionTimeMs;
    
    @Column(length = 1000)
    private String errorMessage;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
