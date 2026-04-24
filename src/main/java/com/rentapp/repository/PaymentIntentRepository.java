package com.rentapp.repository;

import com.rentapp.model.PaymentIntent;
import com.rentapp.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, Long> {

    Optional<PaymentIntent> findByIntentToken(String intentToken);

    @Query("SELECT pi FROM PaymentIntent pi WHERE pi.tenant = :tenant AND pi.status = 'ACTIVE' AND pi.expiresAt > :now")
    Optional<PaymentIntent> findActiveIntentByTenant(@Param("tenant") Tenant tenant, @Param("now") LocalDateTime now);

    @Query("SELECT pi FROM PaymentIntent pi WHERE pi.tenant.id = :tenantId AND pi.status = 'ACTIVE' AND pi.expiresAt > :now")
    Optional<PaymentIntent> findActiveIntentByTenantId(@Param("tenantId") Long tenantId, @Param("now") LocalDateTime now);

    List<PaymentIntent> findByTenantAndStatus(Tenant tenant, String status);

    @Query("SELECT COUNT(pi) FROM PaymentIntent pi WHERE pi.uniqueAmount = :amount AND pi.expiresAt > :now")
    Long countActiveByUniqueAmount(@Param("amount") Double amount, @Param("now") LocalDateTime now);

    @Query("SELECT pi FROM PaymentIntent pi WHERE pi.expiresAt < :now AND pi.status = 'ACTIVE'")
    List<PaymentIntent> findExpiredIntents(@Param("now") LocalDateTime now);
}
