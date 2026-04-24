package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.PaymentConfirmRequest;
import com.rentapp.rentapp.dto.PublicTenantDetailsResponse;
import com.rentapp.rentapp.dto.PaymentSessionResponse;
import com.rentapp.rentapp.entity.Payment;
import com.rentapp.rentapp.entity.PaymentAttempt;
import com.rentapp.rentapp.entity.PaymentIntent;
import com.rentapp.rentapp.entity.Tenant;
import com.rentapp.rentapp.enums.PaymentStatus;
import com.rentapp.rentapp.enums.TenantStatus;
import com.rentapp.rentapp.exception.DuplicatePaymentException;
import com.rentapp.rentapp.exception.InvalidTenantStatusException;
import com.rentapp.rentapp.exception.ResourceNotFoundException;
import com.rentapp.rentapp.repository.PaymentRepository;
import com.rentapp.rentapp.repository.PaymentAttemptRepository;
import com.rentapp.rentapp.repository.TenantRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.util.Optional;

/**
 * Public Payment Service - Handles tenant payment portal logic
 * NO AUTHENTICATION - Public access
 * 
 * NEW: Integrated with PaymentIntentService for multi-signal verification
 */
@Service
@RequirCREATE PAYMENT SESSION (NEW)
     * Creates payment intent with unique amount for verification
     */
    @Transactional
    public PaymentSessionResponse createPaymentSession(Long tenantId, HttpServletRequest request) {
        log.info("Creating payment session for tenant: {}", tenantId);
        
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        
        if (tenant.getStatus() != TenantStatus.ACTIVE) {
            throw new InvalidTenantStatusException("Tenant is not active. Cannot create payment session.");
        }
        
        // Get current month
        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        // Check if already paid for current month
        Optional<Payment> existingPayment = paymentRepository
            .findByTenantIdAndMonth(tenantId, currentMonth);
        
        if (existingPayment.isPresent() && existingPayment.get().getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Payment already completed for " + currentMonth);
        }
        
        // Create payment intent with unique amount
        PaymentIntent intent = paymentIntentService.createIntent(
            tenant, 
            tenant.getRentAmount(), 
            request
        );
        
        // Build response
        PaymentSessionResponse response = new PaymentSessionResponse();
        response.setIntentToken(intent.getIntentToken());
        response.setTenantId(tenant.getId());
        response.setTenantName(tenant.getName());
        response.setBaseAmount(intent.getBaseAmount());
        response.setUniqueAmount(intent.getUniqueAmount());
        response.setAmountOffset(intent.getAmountOffset());
        response.setCreatedAt(intent.getCreatedAt());
        response.setExpiresAt(intent.getExpiresAt());
        response.setValidityMinutes(10);
        response.setUpiId(tenant.getProperty().getUpiId());
        response.setOwnerName(tenant.getProperty().getOwner().getName());
        response.setPropertyName(tenant.getProperty().getName());
        response.setRoomNumber(tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "N/A");
        response.setCurrentMonth(currentMonth);
        
        log.info("Payment session created: token={}, uniqueAmount=₹{}", 
            intent.getIntentToken(), intent.getUniqueAmount());
        
        return response;
    }
    
    /**
     * edArgsConstructor
@Slf4j
public class PublicPaymentService {
    
    private final TenantRepository tenantRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    private final PaymentIntentService paymentIntentService;
    private final PaymentVerificationService verificationService;
    private final PaymentAttemptRepository attemptRepository;
    
    /**
     * Get tenant details for payment page (PUBLIC - no auth)
     * Returns minimal info only
     */
    @Transactional(readOnly = true)
    public PublicTenantDetailsResponse getTenantDetailsForPayment(Long tenantId) {
        log.info("Fetching public tenant details for id: {}", tenantId);
        
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        
        if (tenant.getStatus() != TenantStatus.ACTIVE) {
            throw new InvalidTenantStatusException("Tenant is not active. Cannot process payment.");
        }
        
        // Get current month in format "2026-04"
        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        // Check if already paid for current month
        Optional<Payment> existingPayment = paymentRepository
            .findByTenantIdAndMonth(tenantId, currentMonth);
        
        boolean alreadyPaid = existingPayment
            .map(p -> p.getStatus() == PaymentStatus.PAID)
            .orElse(false);
        
        String paymentStatus = existingPayment
            .map(p -> p.getStatus().toString())
            .orElse("NOT_PAID");
        
        // Build response with minimal data
        PublicTenantDetailsResponse response = new PublicTenantDetailsResponse();
        response.setTenantId(tenant.getId());
        response.setName(tenant.getName());
        response.setRoomNumber(tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "N/A");
        response.setPropertyName(tenant.getProperty().getName());
        response.setRentAmount(tenant.getRentAmount());
        response.setCurrentMonth(currentMonth);
        response.setUpiId(tenant.getProperty().getUpiId());
        response.setAlreadyPaidThisMonth(alreadyPaid);
        response.setPaymentStatus(paymentStatus);
        
        log.info("Tenant details fetched: {} - Room: {} - Rent: {}", 
            tenant.getName(), response.getRoomNumber(), tenant.getRentAmount());
        
        return response;
    }
    
    /**
     * Get tenant details by phone number (PUBLIC - no auth)
     * Returns minimal info only
     */
    @Transactional(readOnly = true)
    public PublicTenantDetailsResponse getTenantDetailsByPhone(String phone) {
        log.info("Fetching public tenant details for phone: {}", phone);
        
        // Clean phone number (remove spaces, dashes, etc.)
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        
        // Find tenant by phone number
        Tenant tenant = tenantRepository.findByPhone(cleanPhone)
            .orElseThrow(() -> new ResourceNotFoundException("No tenant found with phone number: " + phone));
        
        if (tenant.getStatus() != TenantStatus.ACTIVE) {
            throw new InvalidTenantStatusException("Tenant account is not active. Please contact your property owner.");
        }
        
        // Get current month in format "2026-04"
        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        // Check if already paid for current month
        Optional<Payment> existingPayment = paymentRepository
            .findByTenantIdAndMonth(tenant.getId(), currentMonth);
        
        boolean alreadyPaid = existingPayment
            .map(p -> p.getStatus() == PaymentStatus.PAID)
            .orElse(false);
        
        String paymentStatus = existingPayment
            .map(p -> p.getStatus().toString())
            .orElse("NOT_PAID");
        
        // Build response with minimal data
        PublicTenantDetailsResponse response = new PublicTenantDetailsResponse();
        response.setTenantId(tenant.getId());
        response.setName(tenant.getName());
        response.setRoomNumber(tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "N/A");
        response.setPropertyName(tenant.getProperty().getName());
        response.setRentAmount(tenant.getRentAmount());
        response.setCurrentMonth(currentMonth);
        response.setUpiId(tenant.getProperty().getUpiId());
        response.setOwnerName(tenant.getProperty().getOwner().getName());
        response.setAlreadyPaidThisMonth(alreadyPaid);
        response.setPaymentStatus(paymentStatus);
        
        log.info("Tenant details fetched by phone: {} - Name: {} - Room: {}", 
            phone, tenant.getName(), response.getRoomNumber());
        
        return response;
    }
    
    /**
     * Confirm payment with UTR (PUBLIC - no auth)
     * Creates or updates payment record with VERIFY or PAID status
     * 
     * NEW: Uses multi-signal verification scoring
     */
    @Transactional
    public void confirmPayment(PaymentConfirmRequest request) {
        log.info("Confirming payment for tenant: {}, month: {}, UTR: {}", 
            request.getTenantId(), request.getMonth(), request.getUtr());
        
        // Validate UTR format (basic check - should be alphanumeric, 10-20 chars)
        String utr = request.getUtr().trim();
        if (utr.length() < 10 || utr.length() > 20 || !utr.matches("^[A-Za-z0-9]+$")) {
            throw new IllegalArgumentException("Invalid UTR format. UTR should be 10-20 alphanumeric characters.");
        }
        
        Tenant tenant = tenantRepository.findById(request.getTenantId())
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        
        if (tenant.getStatus() != TenantStatus.ACTIVE) {
            throw new InvalidTenantStatusException("Tenant is not active. Cannot process payment.");
        }
        
        // NEW: Verify with multi-signal scoring if intent token provided
        PaymentVerificationService.VerificationResult verificationResult = null;
        PaymentIntent intent = null;
        boolean autoApproved = false;
        
        if (request.getIntentToken() != null && !request.getIntentToken().isEmpty()) {
            // Get and validate payment intent
            Optional<PaymentIntent> intentOpt = paymentIntentService.getActiveIntent(request.getIntentToken());
            
            if (intentOpt.isEmpty()) {
                throw new IllegalArgumentException("Invalid or expired payment session. Please refresh and try again.");
            }
            
            intent = intentOpt.get();
            
            // Validate tenant ID matches
            if (!intent.getTenant().getId().equals(request.getTenantId())) {
                throw new IllegalArgumentException("Payment session does not belong to this tenant.");
            }
            
            // Increment attempt count
            paymentIntentService.incrementAttemptCount(intent);
            
            // Block if too many attempts (>3)
            if (intent.getAttemptCount() > 3) {
                throw new IllegalArgumentException("Too many payment attempts. Please contact support.");
            }
            
            // Run multi-signal verification
            verificationResult = verificationService.verify(
                intent, 
                utr, 
                request.getSubmittedAmount()
            );
            
            // Save payment attempt log
            PaymentAttempt attempt = new PaymentAttempt();
            attempt.setPaymentIntent(intent);
            attempt.setUtrNumber(utr);
            attempt.setSubmittedAmount(request.getSubmittedAmount());
            attempt.setAttemptedAt(LocalDateTime.now());
            attempt.setSessionId(intent.getSessionId());
            attempt.setUserAgent(intent.getUserAgent());
            attempt.setIpAddress(intent.getIpAddress());
            attempt.setConfidenceScore(verificationResult.getConfidenceScore());
            attempt.setConfidenceFactors(verificationService.factorsToJson(verificationResult.getFactors()));
            
            // Determine result based on score
            if (verificationResult.getConfidenceScore() >= 80) {
                attempt.setResult("SUCCESS");
                autoApproved = true;
            } else if (verificationResult.getConfidenceScore() >= 50) {
                attempt.setResult("VERIFY");
            } else {
                attempt.setResult("REJECTED");
                attempt.setRejectionReason(verificationResult.getRecommendation());
            }
            
            attemptRepository.save(attempt);
            
            log.info("Verification result: score={}, status={}, autoApproved={}", 
                verificationResult.getConfidenceScore(), 
                verificationResult.getStatus(), 
                autoApproved);
            
            // Reject low-confidence payments
            if (verificationResult.getConfidenceScore() < 50) {
                throw new IllegalArgumentException(
                    "Payment verification failed. " + verificationResult.getRecommendation()
                );
            }
        }
        
        // Check if payment already exists for this month
        Optional<Payment> existingPayment = paymentRepository
            .findByTenantIdAndMonth(request.getTenantId(), request.getMonth());
        
        if (existingPayment.isPresent()) {
            Payment payment = existingPayment.get();
            
            // If already PAID, don't allow re-submission
            if (payment.getStatus() == PaymentStatus.PAID) {
                throw new DuplicatePaymentException("Payment already verified and confirmed for " + request.getMonth());
            }
            
            // If VERIFY status, update with new UTR
            if (payment.getStatus() == PaymentStatus.VERIFY && !payment.getUtr().equals(utr)) {
                log.warn("Updating UTR for existing VERIFY payment. Old: {}, New: {}", payment.getUtr(), utr);
            }
            
            // Update existing payment
            payment.setUtr(utr);
            payment.setStatus(autoApproved ? PaymentStatus.PAID : PaymentStatus.VERIFY);
            payment.setNotes(buildPaymentNotes(request, verificationResult, autoApproved));
            paymentRepository.save(payment);
            
            log.info("Updated existing payment id: {} with UTR: {}, status: {}", 
                payment.getId(), utr, payment.getStatus());
            
            // Link payment to intent
            if (intent != null) {
                paymentIntentService.markIntentAsUsed(intent, payment.getId());
            }
            
            // Send email notification to owner
            sendPaymentNotificationEmail(tenant, request.getMonth(), payment.getAmount(), utr, verificationResult);
        } else {
            // Create new payment
            Payment payment = new Payment();
            payment.setTenant(tenant);
            payment.setAmount(tenant.getRentAmount());
            payment.setMonth(request.getMonth());
            payment.setUtr(utr);
            payment.setStatus(autoApproved ? PaymentStatus.PAID : PaymentStatus.VERIFY);
            payment.setNotes(buildPaymentNotes(request, verificationResult, autoApproved));
            
            Payment saved = paymentRepository.save(payment);
            
            log.info("Created new payment for tenant: {} with UTR: {}, status: {}", 
                tenant.getId(), utr, payment.getStatus());
            
            // Link payment to intent
            if (intent != null) {
                paymentIntentService.markIntentAsUsed(intent, saved.getId());
            }
            
            // Send email notification to owner
            sendPaymentNotificationEmail(tenant, request.getMonth(), payment.getAmount(), utr, verificationResult);
        }
    }
    
    /**
     * Build payment notes with verification details
     */
    private String buildPaymentNotes(PaymentConfirmRequest request, 
                                     PaymentVerificationService.VerificationResult verificationResult,
                                     boolean autoApproved) {
        StringBuilder notes = new StringBuilder();
        
        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            notes.append(request.getNotes());
        } else {
            notes.append("Paid via UPI");
        }
        
        if (verificationResult != null) {
            notes.append(String.format(" | Confidence: %d%% (%s)", 
                verificationResult.getConfidenceScore(), 
                verificationResult.getStatus()));
            
            if (autoApproved) {
                notes.append(" | AUTO-APPROVED");
            }
        }
        
        return notes.toString();
    }
    
    /**
     * Send email notification to owner about new payment
     */
    private void sendPaymentNotificationEmail(Tenant tenant, String month, double amount, String utr,
                                             PaymentVerificationService.VerificationResult verificationResult) {
        try {
            String ownerEmail = tenant.getProperty().getOwner().getEmail();
            String tenantName = tenant.getName();
            
            // Add verification info to email if available
            String additionalInfo = "";
            if (verificationResult != null) {
                additionalInfo = String.format("\n\nVerification Confidence: %d%% (%s)\n%s", 
                    verificationResult.getConfidenceScore(),
                    verificationResult.getStatus(),
                    verificationResult.getRecommendation());
            }
            
            emailService.sendPaymentNotification(ownerEmail, tenantName, month, amount, utr + additionalInfo);
            log.info("Payment notification email sent to owner: {}", ownerEmail);
        } catch (Exception e) {
            // Don't fail payment confirmation if email fails
            log.error("Failed to send payment notification email: {}", e.getMessage());
        }
    }
}
