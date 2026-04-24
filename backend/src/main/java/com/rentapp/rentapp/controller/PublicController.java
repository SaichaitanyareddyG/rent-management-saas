package com.rentapp.rentapp.controller;

import com.rentapp.rentapp.dto.MessageResponse;
import com.rentapp.rentapp.dto.PaymentConfirmRequest;
import com.rentapp.rentapp.dto.PaymentSessionResponse;
import com.rentapp.rentapp.dto.PublicTenantDetailsResponse;
import com.rentapp.rentapp.service.PublicPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public Payment Controller - NO AUTHENTICATION REQUIRED
 * Used for tenant payment portal
 * 
 * Security: Minimal data exposure, no sensitive info
 * NEW: Payment intent verification system integrated
 */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PublicController {
    
    private final PublicPaymentService publicPaymentService;
    
    /**
     * NEW: Create payment session with unique amount
     * Step 1 of payment flow - generates intent token and unique amount
     */
    @PostMapping("/payment-session")
    public ResponseEntity<PaymentSessionResponse> createPaymentSession(
            @RequestParam Long tenantId,
            HttpServletRequest request) {
        log.info("Public API: Creating payment session for tenant: {}", tenantId);
        PaymentSessionResponse response = publicPaymentService.createPaymentSession(tenantId, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get tenant details for payment page (public, no auth)
     * Returns minimal info: name, room, rent amount, UPI ID
     */
    @GetMapping("/tenant/{id}")
    public ResponseEntity<PublicTenantDetailsResponse> getTenantDetails(@PathVariable Long id) {
        log.info("Public API: Fetching tenant details for id: {}", id);
        PublicTenantDetailsResponse response = publicPaymentService.getTenantDetailsForPayment(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get tenant details by phone number (public, no auth)
     * Used for tenant to find their account using phone number
     */
    @GetMapping("/tenant/phone/{phone}")
    public ResponseEntity<PublicTenantDetailsResponse> getTenantByPhone(@PathVariable String phone) {
        log.info("Public API: Fetching tenant details for phone: {}", phone);
        PublicTenantDetailsResponse response = publicPaymentService.getTenantDetailsByPhone(phone);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Confirm payment after UPI transaction (public, no auth)
     * Tenant submits UTR after payment
     */
    @PostMapping("/payments/confirm")
    public ResponseEntity<MessageResponse> confirmPayment(@Valid @RequestBody PaymentConfirmRequest request) {
        log.info("Public API: Confirming payment for tenant: {}, month: {}, UTR: {}", 
            request.getTenantId(), request.getMonth(), request.getUtr());
        
        publicPaymentService.confirmPayment(request);
        
        return ResponseEntity.ok(new MessageResponse(
            "Payment submitted successfully! Your payment is under verification."
        ));
    }
}
