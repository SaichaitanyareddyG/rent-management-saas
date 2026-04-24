package com.rentapp.rentapp.repository;

import com.rentapp.rentapp.entity.Payment;
import com.rentapp.rentapp.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PaymentRepository - CRITICAL: All queries filter through tenant.property.owner.id
 * 
 * Security Pattern: Payment → Tenant → Property → Owner
 * Deep relationship validation for owner isolation
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    /**
     * Find all payments belonging to tenants of properties owned by this owner
     * SECURITY: Filters through tenant.property.owner relationship
     */
    List<Payment> findByTenantPropertyOwnerId(Long ownerId);
    
    /**
     * Find all payments belonging to tenants of properties owned by this owner (PAGINATED)
     * SECURITY: Filters through tenant.property.owner relationship
     */
    Page<Payment> findByTenantPropertyOwnerId(Long ownerId, Pageable pageable);
    
    /**
     * Find payment by ID only if it belongs to owner's tenant
     * SECURITY: Triple validation - ID match + tenant + owner match
     */
    Optional<Payment> findByIdAndTenantPropertyOwnerId(Long id, Long ownerId);
    
    /**
     * Find payments for a specific tenant (with owner validation)
     * SECURITY: Validates tenant belongs to owner
     */
    List<Payment> findByTenantIdAndTenantPropertyOwnerId(Long tenantId, Long ownerId);
    
    /**
     * Find payment for tenant in specific month
     * CRITICAL: Used to prevent duplicate payments
     */
    Optional<Payment> findByTenantIdAndMonth(Long tenantId, String month);
    
    /**
     * Find payment for tenant in specific month (with owner validation)
     * SECURITY: Validates ownership before checking duplicates
     */
    Optional<Payment> findByTenantIdAndMonthAndTenantPropertyOwnerId(Long tenantId, String month, Long ownerId);
    
    /**
     * Find all payments for a specific month (owner-filtered)
     * Dashboard: Monthly revenue, pending payments
     */
    List<Payment> findByMonthAndTenantPropertyOwnerId(String month, Long ownerId);
    
    /**
     * Find payments by status (owner-filtered)
     * Dashboard: Count pending, verify, paid payments
     */
    List<Payment> findByStatusAndTenantPropertyOwnerId(PaymentStatus status, Long ownerId);
    
    /**
     * Find payments for a specific property (with owner validation)
     */
    List<Payment> findByTenantPropertyIdAndTenantPropertyOwnerId(Long propertyId, Long ownerId);
    
    /**
     * Count payments by status for dashboard metrics
     */
    Long countByStatusAndTenantPropertyOwnerId(PaymentStatus status, Long ownerId);
    
    /**
     * Calculate total revenue (paid payments only)
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'PAID' AND p.tenant.property.owner.id = :ownerId")
    Double sumPaidAmountByOwnerId(@Param("ownerId") Long ownerId);
    
    /**
     * Calculate monthly revenue (paid payments for specific month)
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'PAID' AND p.month = :month AND p.tenant.property.owner.id = :ownerId")
    Double sumPaidAmountByMonthAndOwnerId(@Param("month") String month, @Param("ownerId") Long ownerId);
}
