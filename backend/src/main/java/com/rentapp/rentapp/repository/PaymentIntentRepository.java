package com.rentapp.rentapp.repository;

import com.rentapp.rentapp.entity.PaymentIntent;
import com.rentapp.rentapp.entity.Tenant;
import com.rentapp.rentapp.enums.PaymentIntentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * PaymentIntentRepository - Manages payment intent queries
 */
@Repository
public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, Long> {
    
    /**
     * Find active intent for a tenant
     */
    @Query("SELECT pi FROM PaymentIntent pi WHERE pi.tenant = :tenant " +
           "AND pi.status = 'ACTIVE' AND pi.expiresAt > :now")
    Optional<PaymentIntent> findActiveIntentByTenant(
        @Param("tenant") Tenant tenant,
        @Param("now") LocalDateTime now
    );
    
    /**
     * Find intent by token
     */
    Optional<PaymentIntent> findByIntentToken(String intentToken);
    
    /**
     * Count active intents with same unique amount (collision detection)
     */
    @Query("SELECT COUNT(pi) FROM PaymentIntent pi WHERE pi.uniqueAmount = :uniqueAmount " +
           "AND pi.status = 'ACTIVE' AND pi.expiresAt > :now")
    Long countActiveByUniqueAmount(
        @Param("uniqueAmount") Double uniqueAmount,
        @Param("now") LocalDateTime now
    );
    
    /**
     * Find expired intents for cleanup
     */
    @Query("SELECT pi FROM PaymentIntent pi WHERE pi.status = 'ACTIVE' " +
           "AND pi.expiresAt <= :now")
    List<PaymentIntent> findExpiredIntents(@Param("now") LocalDateTime now);
    
    /**
     * Find intent by tenant and month (legacy support)
     */
    Optional<PaymentIntent> findByTenantIdAndMonth(Long tenantId, String month);
    
    /**
     * Find intent by tenant, month and status (legacy support)
     */
    Optional<PaymentIntent> findByTenantIdAndMonthAndStatus(
        Long tenantId, 
        String month, 
        PaymentIntentStatus status
    );
    
    /**
     * Find all intents for a tenant
     */
    @Query("SELECT pi FROM PaymentIntent pi WHERE pi.tenant.id = :tenantId")
    List<PaymentIntent> findByTenantId(@Param("tenantId") Long tenantId);
    
    /**
     * Find intents by status
     */
    List<PaymentIntent> findByStatus(PaymentIntentStatus status);
}
