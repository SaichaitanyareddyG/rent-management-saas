package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.PaymentConfirmRequest;
import com.rentapp.rentapp.dto.PublicTenantDetailsResponse;
import com.rentapp.rentapp.entity.Payment;
import com.rentapp.rentapp.entity.Tenant;
import com.rentapp.rentapp.enums.PaymentStatus;
import com.rentapp.rentapp.enums.TenantStatus;
import com.rentapp.rentapp.exception.DuplicatePaymentException;
import com.rentapp.rentapp.exception.InvalidTenantStatusException;
import com.rentapp.rentapp.exception.ResourceNotFoundException;
import com.rentapp.rentapp.repository.PaymentRepository;
import com.rentapp.rentapp.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Public Payment Service - Handles tenant payment portal logic
 * NO AUTHENTICATION - Public access
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PublicPaymentService {
    
    private final TenantRepository tenantRepository;
    private final PaymentRepository paymentRepository;
    
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
     * Creates or updates payment record with VERIFY status
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
            payment.setStatus(PaymentStatus.VERIFY);
            payment.setNotes(request.getNotes() != null ? request.getNotes() : "Paid via UPI");
            paymentRepository.save(payment);
            
            log.info("Updated existing payment id: {} with UTR: {}", payment.getId(), utr);
        } else {
            // Create new payment
            Payment payment = new Payment();
            payment.setTenant(tenant);
            payment.setAmount(tenant.getRentAmount());
            payment.setMonth(request.getMonth());
            payment.setUtr(utr);
            payment.setStatus(PaymentStatus.VERIFY);
            payment.setNotes(request.getNotes() != null ? request.getNotes() : "Paid via UPI");
            
            paymentRepository.save(payment);
            
            log.info("Created new payment for tenant: {} with UTR: {}", tenant.getId(), utr);
        }
    }
}
