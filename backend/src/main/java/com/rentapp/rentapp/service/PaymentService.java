package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.*;
import com.rentapp.rentapp.entity.Payment;
import com.rentapp.rentapp.entity.PaymentIntent;
import com.rentapp.rentapp.entity.Tenant;
import com.rentapp.rentapp.enums.PaymentIntentStatus;
import com.rentapp.rentapp.enums.PaymentStatus;
import com.rentapp.rentapp.mapper.PaymentMapper;
import com.rentapp.rentapp.repository.PaymentIntentRepository;
import com.rentapp.rentapp.repository.PaymentRepository;
import com.rentapp.rentapp.security.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PaymentService - Core payment tracking and verification logic
 * 
 * Flow:
 * 1. User clicks "Pay Rent" → initiatePayment() creates PaymentIntent
 * 2. User pays via UPI, gets UTR → confirmPayment() creates Payment with VERIFY status
 * 3. Admin verifies → updatePaymentStatus() marks as PAID
 * 
 * Security:
 * - Always validates tenant ownership through tenant.property.owner.id
 * - Prevents duplicate payments for same tenant+month
 * - Validates payment intent before confirmation
 */
@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final PaymentIntentRepository paymentIntentRepository;
    private final PaymentMapper paymentMapper;
    private final TenantService tenantService;
    private final SecurityContextUtil securityContextUtil;
    
    /**
     * Step 1: Initiate payment (creates PaymentIntent)
     * User clicks "Pay Rent" → System creates intent
     * 
     * @param request Contains tenantId, month, amount
     * @return PaymentIntent details
     */
    @Transactional
    public PaymentIntentResponse initiatePayment(PaymentInitiateRequest request) {
        // SECURITY STEP 1: Get ownerId from JWT
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // SECURITY STEP 2: Validate tenant belongs to this owner
        Tenant tenant = tenantService.getTenantEntity(request.getTenantId(), ownerId);
        
        // BUSINESS RULE STEP 3: Check if payment already exists for this month
        paymentRepository.findByTenantIdAndMonth(request.getTenantId(), request.getMonth())
                .ifPresent(p -> {
                    throw new RuntimeException("Payment already exists for tenant in " + request.getMonth());
                });
        
        // BUSINESS RULE STEP 4: Check if payment intent already exists
        paymentIntentRepository.findByTenantIdAndMonthAndStatus(
                request.getTenantId(), 
                request.getMonth(), 
                PaymentIntentStatus.INITIATED
        ).ifPresent(intent -> {
            throw new RuntimeException("Payment already initiated for this month. Please complete or cancel existing intent.");
        });
        
        // STEP 5: Create payment intent
        PaymentIntent intent = new PaymentIntent();
        intent.setTenantId(request.getTenantId());
        intent.setAmount(request.getAmount());
        intent.setMonth(request.getMonth());
        intent.setStatus(PaymentIntentStatus.INITIATED);
        
        PaymentIntent saved = paymentIntentRepository.save(intent);
        
        return new PaymentIntentResponse(
            saved.getId(),
            saved.getTenantId(),
            tenant.getName(),
            saved.getAmount(),
            saved.getMonth(),
            saved.getStatus(),
            saved.getCreatedAt(),
            null
        );
    }
    
    /**
     * Step 2: Confirm payment with UTR (creates Payment with VERIFY status)
     * User submits UPI transaction reference → System creates payment record
     * 
     * @param request Contains tenantId, month, utr
     * @return Payment details with VERIFY status
     */
    @Transactional
    public PaymentResponse confirmPayment(PaymentConfirmRequest request) {
        // SECURITY STEP 1: Get ownerId from JWT
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // SECURITY STEP 2: Validate tenant belongs to this owner
        Tenant tenant = tenantService.getTenantEntity(request.getTenantId(), ownerId);
        
        // BUSINESS RULE STEP 3: Check if payment already confirmed
        paymentRepository.findByTenantIdAndMonth(request.getTenantId(), request.getMonth())
                .ifPresent(p -> {
                    throw new RuntimeException("Payment already confirmed for " + request.getMonth());
                });
        
        // BUSINESS RULE STEP 4: Find and validate payment intent
        PaymentIntent intent = paymentIntentRepository.findByTenantIdAndMonthAndStatus(
                request.getTenantId(),
                request.getMonth(),
                PaymentIntentStatus.INITIATED
        ).orElseThrow(() -> new RuntimeException("No payment intent found. Please initiate payment first."));
        
        // STEP 5: Create payment with VERIFY status
        Payment payment = new Payment();
        payment.setTenant(tenant);
        payment.setAmount(intent.getAmount());
        payment.setMonth(request.getMonth());
        payment.setStatus(PaymentStatus.VERIFY);  // Awaiting admin verification
        payment.setUtr(request.getUtr());
        payment.setNotes(request.getNotes());
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // STEP 6: Mark intent as completed
        intent.setStatus(PaymentIntentStatus.COMPLETED);
        intent.setCompletedAt(LocalDateTime.now());
        paymentIntentRepository.save(intent);
        
        return paymentMapper.toResponse(savedPayment);
    }
    
    /**
     * Step 3: Update payment status (admin verification)
     * Admin verifies UTR → Marks payment as PAID
     * 
     * @param paymentId Payment ID
     * @param status New status (typically PAID or PENDING)
     * @return Updated payment
     */
    @Transactional
    public PaymentResponse updatePaymentStatus(Long paymentId, PaymentStatus status) {
        // SECURITY: Get ownerId from JWT
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Find payment with ownership validation
        Payment payment = paymentRepository.findByIdAndTenantPropertyOwnerId(paymentId, ownerId)
                .orElseThrow(() -> new RuntimeException("Payment not found or access denied"));
        
        PaymentStatus oldStatus = payment.getStatus();
        payment.setStatus(status);
        
        // Mark paidAt timestamp when status changes to PAID
        if (status == PaymentStatus.PAID && oldStatus != PaymentStatus.PAID) {
            payment.setPaidAt(LocalDateTime.now());
        }
        
        return paymentMapper.toResponse(paymentRepository.save(payment));
    }
    
    /**
     * Get all payments for owner
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        return paymentRepository.findByTenantPropertyOwnerId(ownerId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all payments for owner (PAGINATED)
     */
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPaymentsPaginated(Pageable pageable) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        return paymentRepository.findByTenantPropertyOwnerId(ownerId, pageable)
                .map(paymentMapper::toResponse);
    }
    
    /**
     * Get payments for a specific month
     * Dashboard: Monthly payment tracking
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByMonth(String month) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        return paymentRepository.findByMonthAndTenantPropertyOwnerId(month, ownerId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get payments by status
     * Dashboard: Track pending, verify, paid payments
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        return paymentRepository.findByStatusAndTenantPropertyOwnerId(status, ownerId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get payments for a tenant
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByTenant(Long tenantId) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Validate tenant ownership
        tenantService.getTenantEntity(tenantId, ownerId);
        
        return paymentRepository.findByTenantIdAndTenantPropertyOwnerId(tenantId, ownerId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get single payment by ID
     */
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        Payment payment = paymentRepository.findByIdAndTenantPropertyOwnerId(paymentId, ownerId)
                .orElseThrow(() -> new RuntimeException("Payment not found or access denied"));
        
        return paymentMapper.toResponse(payment);
    }
    
    /**
     * Delete payment (before confirmation/verification)
     */
    @Transactional
    public void deletePayment(Long paymentId) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        Payment payment = paymentRepository.findByIdAndTenantPropertyOwnerId(paymentId, ownerId)
                .orElseThrow(() -> new RuntimeException("Payment not found or access denied"));
        
        paymentRepository.delete(payment);
    }
    
    /**
     * Dashboard: Count payments by status
     */
    @Transactional(readOnly = true)
    public Long countPaymentsByStatus(PaymentStatus status) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        return paymentRepository.countByStatusAndTenantPropertyOwnerId(status, ownerId);
    }
    
    /**
     * Dashboard: Calculate total paid revenue
     */
    @Transactional(readOnly = true)
    public Double getTotalRevenue() {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        Double revenue = paymentRepository.sumPaidAmountByOwnerId(ownerId);
        return revenue != null ? revenue : 0.0;
    }
    
    /**
     * Dashboard: Calculate monthly revenue
     */
    @Transactional(readOnly = true)
    public Double getMonthlyRevenue(String month) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        Double revenue = paymentRepository.sumPaidAmountByMonthAndOwnerId(month, ownerId);
        return revenue != null ? revenue : 0.0;
    }
    
    /**
     * Utility: Get current month in standard format
     */
    public String getCurrentMonth() {
        return YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }
    
    /**
     * Bulk operation: Generate payments for all active tenants for a given month
     * 
     * @param month Month in format yyyy-MM (e.g., "2024-04")
     * @return Number of payments generated
     */
    @Transactional
    public int generateMonthlyPaymentsForAllTenants(String month) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        
        // Get all active tenants for this owner
        List<Tenant> activeTenants = tenantService.getAllActiveTenants(ownerId);
        
        int generatedCount = 0;
        for (Tenant tenant : activeTenants) {
            // Check if payment already exists
            if (paymentRepository.findByTenantIdAndMonth(tenant.getId(), month).isEmpty()) {
                // Create payment
                Payment payment = new Payment();
                payment.setTenant(tenant);
                payment.setMonth(month);
                payment.setAmount(tenant.getRentAmount());
                payment.setStatus(PaymentStatus.PENDING);
                payment.setNotes("Auto-generated monthly rent");
                
                paymentRepository.save(payment);
                generatedCount++;
            }
        }
        
        return generatedCount;
    }
}
