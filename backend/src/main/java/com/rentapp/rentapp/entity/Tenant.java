package com.rentapp.rentapp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.rentapp.rentapp.enums.TenantStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Tenant Entity - Core business entity for rent management
 * 
 * Security: Tenant → Property → Owner AND Tenant → Room → Property → Owner
 * Double relationship ensures data integrity
 */
@Entity
@Table(name = "tenants", indexes = {
    @Index(name = "idx_tenant_property", columnList = "property_id"),
    @Index(name = "idx_tenant_room", columnList = "room_id"),
    @Index(name = "idx_tenant_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"property", "room", "payments"})
public class Tenant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String phone;
    
    @Column
    private String email;
    
    @Column(length = 500)
    private String nativeAddress;
    
    @Column(length = 200)
    private String companyOrCollege;
    
    @Column(length = 15)
    private String emergencyContact;
    
    @Column(length = 100)
    private String guardianName;
    
    @Column(length = 12)
    private String aadharNumber;  // Stored as-is, masked on display
    
    @Column(nullable = false)
    private Double rentAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TenantStatus status = TenantStatus.ACTIVE;
    
    @Column(nullable = false)
    private LocalDate joiningDate;
    
    // Smart features for better rent management
    @Column(nullable = false)
    private Integer rentDueDay = 5;  // Default: 5th of every month
    
    @Column
    private Double advanceAmount = 0.0;
    
    @Column(length = 1000)
    private String notes;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * CRITICAL: Tenant belongs to Property
     * This is the primary ownership chain for security validation
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @JsonBackReference
    private Property property;
    
    /**
     * CRITICAL: Tenant belongs to Room
     * Room must belong to the same Property - validated in service layer
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonBackReference
    private Room room;
    
    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Payment> payments = new ArrayList<>();
}
