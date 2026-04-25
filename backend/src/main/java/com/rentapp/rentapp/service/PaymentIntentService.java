package com.rentapp.rentapp.service;

import com.rentapp.rentapp.entity.PaymentIntent;
import com.rentapp.rentapp.entity.Tenant;
import com.rentapp.rentapp.enums.PaymentIntentStatus;
import com.rentapp.rentapp.repository.PaymentIntentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * PaymentIntentService - Manages intent-based payment sessions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentIntentService {

    private final PaymentIntentRepository paymentIntentRepository;
    private static final int INTENT_VALIDITY_MINUTES = 10;
    private static final int MIN_OFFSET = 1;
    private static final int MAX_OFFSET = 10;

    /**
     * Create a new payment intent with unique amount
     * Only ONE active intent per tenant allowed
     */
    @Transactional
    public PaymentIntent createIntent(Tenant tenant, Double baseAmount, HttpServletRequest request) {
        // Cancel any existing active intent for this tenant
        Optional<PaymentIntent> existingIntent = paymentIntentRepository
                .findActiveIntentByTenant(tenant, LocalDateTime.now());
        
        if (existingIntent.isPresent()) {
            PaymentIntent intent = existingIntent.get();
            intent.setStatus(PaymentIntentStatus.CANCELLED);
            paymentIntentRepository.save(intent);
            log.info("Cancelled previous active intent {} for tenant {}", intent.getIntentToken(), tenant.getId());
        }

        // Generate unique amount offset
        int offset = generateUniqueOffset(baseAmount);
        Double uniqueAmount = baseAmount + offset;

        // Create new intent
        PaymentIntent intent = new PaymentIntent();
        intent.setIntentToken(UUID.randomUUID().toString());
        intent.setTenant(tenant);
        intent.setBaseAmount(baseAmount);
        intent.setUniqueAmount(uniqueAmount);
        intent.setAmountOffset(offset);
        intent.setCreatedAt(LocalDateTime.now());
        intent.setExpiresAt(LocalDateTime.now().plusMinutes(INTENT_VALIDITY_MINUTES));
        intent.setStatus(PaymentIntentStatus.ACTIVE);
        intent.setAttemptCount(0);

        // Session binding
        if (request != null) {
            intent.setSessionId(request.getSession().getId());
            intent.setUserAgent(request.getHeader("User-Agent"));
            intent.setIpAddress(getClientIP(request));
        }

        PaymentIntent saved = paymentIntentRepository.save(intent);
        log.info("Created payment intent {} for tenant {} with unique amount ₹{}", 
                saved.getIntentToken(), tenant.getId(), uniqueAmount);
        
        return saved;
    }

    /**
     * Generate unique offset (1-10 rupees) to make amount unique
     * Avoids collision with other active intents
     */
    private int generateUniqueOffset(Double baseAmount) {
        int maxRetries = 20;
        int attempt = 0;

        while (attempt < maxRetries) {
            int offset = ThreadLocalRandom.current().nextInt(MIN_OFFSET, MAX_OFFSET + 1);
            Double uniqueAmount = baseAmount + offset;

            // Check if this amount is already in use
            Long count = paymentIntentRepository.countActiveByUniqueAmount(
                    uniqueAmount, LocalDateTime.now());

            if (count == 0) {
                return offset;
            }

            attempt++;
        }

        // Fallback: return random offset (collision unlikely with 1-10 range)
        return ThreadLocalRandom.current().nextInt(MIN_OFFSET, MAX_OFFSET + 1);
    }

    /**
     * Validate and retrieve intent by token
     */
    public Optional<PaymentIntent> getActiveIntent(String intentToken) {
        return paymentIntentRepository.findByIntentToken(intentToken)
                .filter(PaymentIntent::isActive);
    }

    /**
     * Increment attempt count
     */
    @Transactional
    public void incrementAttemptCount(PaymentIntent intent) {
        intent.setAttemptCount(intent.getAttemptCount() + 1);
        intent.setLastAttemptAt(LocalDateTime.now());
        paymentIntentRepository.save(intent);
    }

    /**
     * Mark intent as used after successful payment
     */
    @Transactional
    public void markIntentAsUsed(PaymentIntent intent, Long paymentId) {
        intent.setStatus(PaymentIntentStatus.USED);
        intent.setPaymentId(paymentId);
        paymentIntentRepository.save(intent);
        log.info("Marked intent {} as USED for payment {}", intent.getIntentToken(), paymentId);
    }

    /**
     * Scheduled cleanup of expired intents (runs every hour)
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredIntents() {
        List<PaymentIntent> expired = paymentIntentRepository
                .findExpiredIntents(LocalDateTime.now());

        for (PaymentIntent intent : expired) {
            intent.setStatus(PaymentIntentStatus.EXPIRED);
        }

        if (!expired.isEmpty()) {
            paymentIntentRepository.saveAll(expired);
            log.info("Cleaned up {} expired payment intents", expired.size());
        }
    }

    /**
     * Get client IP address (handles proxy headers)
     */
    private String getClientIP(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }
}
