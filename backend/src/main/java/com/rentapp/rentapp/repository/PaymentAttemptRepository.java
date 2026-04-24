package com.rentapp.rentapp.repository;

import com.rentapp.rentapp.entity.PaymentAttempt;
import com.rentapp.rentapp.entity.PaymentIntent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {

    List<PaymentAttempt> findByPaymentIntent(PaymentIntent paymentIntent);

    @Query("SELECT pa FROM PaymentAttempt pa WHERE pa.utrNumber = :utr")
    List<PaymentAttempt> findByUtrNumber(@Param("utr") String utr);

    @Query("SELECT COUNT(pa) FROM PaymentAttempt pa WHERE pa.paymentIntent = :intent")
    Long countAttemptsByIntent(@Param("intent") PaymentIntent intent);

    @Query("SELECT pa FROM PaymentAttempt pa WHERE pa.paymentIntent.tenant.id = :tenantId AND pa.attemptedAt > :since")
    List<PaymentAttempt> findRecentAttemptsByTenant(@Param("tenantId") Long tenantId, @Param("since") LocalDateTime since);

    Optional<PaymentAttempt> findFirstByUtrNumber(String utrNumber);
}
