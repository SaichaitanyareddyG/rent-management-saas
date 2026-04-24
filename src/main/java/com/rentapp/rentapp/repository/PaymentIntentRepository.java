package com.rentapp.rentapp.repository;

import com.rentapp.rentapp.entity.PaymentIntent;
import com.rentapp.rentapp.enums.PaymentIntentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PaymentIntentRepository - Tracks payment initiation and completion
 */
@Repository
public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, Long> {
    
    /**
     * Find intent by tenant and month
     * Used to check if payment already initiated for this month
     */
    Optional<PaymentIntent> findByTenantIdAndMonth(Long tenantId, String month);
    
    /**
     * Find intent by tenant, month, and status
     * Check for pending intents before creating new one
     */
    Optional<PaymentIntent> findByTenantIdAndMonthAndStatus(Long tenantId, String month, PaymentIntentStatus status);
    
    /**
     * Find all intents for a tenant
     */
    List<PaymentIntent> findByTenantId(Long tenantId);
    
    /**
     * Find intents by status
     * Dashboard: Track abandoned payments (INITIATED but not completed)
     */
    List<PaymentIntent> findByStatus(PaymentIntentStatus status);
}
