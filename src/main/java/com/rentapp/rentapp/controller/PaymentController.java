package com.rentapp.rentapp.controller;

import com.rentapp.rentapp.dto.*;
import com.rentapp.rentapp.enums.PaymentStatus;
import com.rentapp.rentapp.service.PaymentService;
import com.rentapp.rentapp.util.CsvExportUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PaymentController - UPI-based rent payment tracking and verification
 * 
 * Flow:
 * 1. POST /payments/initiate - User clicks "Pay Rent"
 * 2. POST /payments/confirm - User submits UTR after UPI payment
 * 3. PATCH /payments/{id}/status - Admin verifies and marks as PAID
 * 
 * CRITICAL SECURITY:
 * 1. All operations validate tenant ownership through property.owner.id
 * 2. Prevents duplicate payments for same tenant+month
 * 3. PaymentIntent ensures tracking from initiation to confirmation
 * 4. OwnerId automatically extracted from JWT
 */
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {
    
    private final PaymentService paymentService;
    private final CsvExportUtil csvExportUtil;
    
    /**
     * Step 1: Initiate payment
     * User clicks "Pay Rent" → Creates PaymentIntent
     * 
     * @param request Contains tenantId, month, amount
     * @return PaymentIntent with INITIATED status
     */
    @PostMapping("/initiate")
    public ResponseEntity<PaymentIntentResponse> initiatePayment(@Valid @RequestBody PaymentInitiateRequest request) {
        // OwnerId extracted inside service via SecurityContext
        // Tenant ownership validated before creating intent
        PaymentIntentResponse response = paymentService.initiatePayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Get all payments (PAGINATED)
     * Sorted by creation date (newest first) by default
     * 
     * @param page Page number (default: 0)
     * @param size Page size (default: 10)
     * @param sort Sort field (default: createdAt)
     * @param direction Sort direction (default: DESC)
     * @return Paginated list of payments
     */
    @GetMapping("/paginated")
    public ResponseEntity<Page<PaymentResponse>> getAllPaymentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<PaymentResponse> payments = paymentService.getAllPaymentsPaginated(pageable);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Step 2: Confirm payment with UTR
     * User submits UPI transaction reference → Creates Payment with VERIFY status
     * 
     * @param request Contains tenantId, month, utr
     * @return Payment with VERIFY status (awaiting admin verification)
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(@Valid @RequestBody PaymentConfirmRequest request) {
        // OwnerId extracted inside service via SecurityContext
        // Validates tenant ownership and payment intent
        PaymentResponse response = paymentService.confirmPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Step 3: Update payment status (admin verification)
     * Admin verifies UTR → Marks as PAID
     * 
     * @param id Payment ID
     * @param status New status (PAID, PENDING, VERIFY)
     * @return Updated payment
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        PaymentResponse updated = paymentService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Get all payments for owner
     * Filtered by owner through tenant.property.owner.id
     */
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Get payments for a specific month
     * 
     * @param month Format: "2026-04" or "April 2026"
     * @return List of payments for that month
     */
    @GetMapping("/month/{month}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByMonth(@PathVariable String month) {
        List<PaymentResponse> payments = paymentService.getPaymentsByMonth(month);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Get payments by status
     * 
     * @param status PAID, PENDING, or VERIFY
     * @return List of payments with that status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        List<PaymentResponse> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Get payments for a tenant
     * 
     * @param tenantId Tenant ID
     * @return Payment history for tenant
     */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTenant(@PathVariable Long tenantId) {
        // Service validates tenant ownership
        List<PaymentResponse> payments = paymentService.getPaymentsByTenant(tenantId);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Get single payment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        PaymentResponse payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }
    
    /**
     * Delete payment (before confirmation)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Dashboard: Get payment statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPaymentStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalPaid", paymentService.countPaymentsByStatus(PaymentStatus.PAID));
        stats.put("totalPending", paymentService.countPaymentsByStatus(PaymentStatus.PENDING));
        stats.put("totalVerify", paymentService.countPaymentsByStatus(PaymentStatus.VERIFY));
        stats.put("totalRevenue", paymentService.getTotalRevenue());
        stats.put("currentMonth", paymentService.getCurrentMonth());
        stats.put("monthlyRevenue", paymentService.getMonthlyRevenue(paymentService.getCurrentMonth()));
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Export all payments to CSV
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        byte[] csvData = csvExportUtil.exportPaymentsToCsv(payments);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "payments.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
    
    /**
     * Bulk operation: Generate monthly payments for all active tenants
     * 
     * @param month Month in format yyyy-MM (e.g., "2024-04")
     * @return Number of payments generated
     */
    @PostMapping("/generate-monthly")
    public ResponseEntity<Map<String, Object>> generateMonthlyPayments(@RequestParam String month) {
        int generatedCount = paymentService.generateMonthlyPaymentsForAllTenants(month);
        
        Map<String, Object> response = new HashMap<>();
        response.put("month", month);
        response.put("generated", generatedCount);
        response.put("message", "Successfully generated " + generatedCount + " payments for " + month);
        
        return ResponseEntity.ok(response);
    }
}
