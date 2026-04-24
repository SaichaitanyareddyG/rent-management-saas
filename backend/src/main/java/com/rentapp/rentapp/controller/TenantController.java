package com.rentapp.rentapp.controller;

import com.rentapp.rentapp.dto.TenantRequest;
import com.rentapp.rentapp.dto.TenantResponse;
import com.rentapp.rentapp.enums.TenantStatus;
import com.rentapp.rentapp.service.TenantService;
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

import java.util.List;

/**
 * TenantController - Core business endpoints for rent management
 * 
 * CRITICAL SECURITY RULES:
 * 1. Never expose entities directly - always use DTOs
 * 2. OwnerId automatically extracted from JWT via SecurityContext
 * 3. Service layer validates property AND room ownership before operations
 * 4. No findAll() without owner filtering
 * 5. All data filtered through property.owner.id relationship
 */
@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class TenantController {
    
    private final TenantService tenantService;
    private final CsvExportUtil csvExportUtil;
    
    /**
     * Create a new tenant
     * SECURITY: Service validates property and room ownership before creating tenant
     * 
     * @param request TenantRequest DTO with validation (includes propertyId and roomId)
     * @return Created tenant with 201 status
     */
    @PostMapping
    public ResponseEntity<TenantResponse> createTenant(@Valid @RequestBody TenantRequest request) {
        // OwnerId extracted inside service via SecurityContext
        // Property and room ownership validated before tenant creation
        TenantResponse response = tenantService.createTenant(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Get all tenants for the authenticated owner (PAGINATED)
     * Automatically filtered by owner through property relationship
     * 
     * @param page Page number (default: 0)
     * @param size Page size (default: 10)
     * @param sort Sort field (default: id)
     * @param direction Sort direction (default: ASC)
     * @return Paginated list of tenants
     */
    @GetMapping("/paginated")
    public ResponseEntity<Page<TenantResponse>> getAllTenantsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "ASC") String direction) {
        
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<TenantResponse> tenants = tenantService.getAllTenantsPaginated(pageable);
        return ResponseEntity.ok(tenants);
    }
    
    /**
     * Get all tenants for the authenticated owner
     * Automatically filtered by owner through property relationship
     * 
     * @return List of tenants across all owner's properties
     */
    @GetMapping
    public ResponseEntity<List<TenantResponse>> getAllTenants() {
        // OwnerId automatically extracted from JWT
        // Filters through property.owner.id relationship
        List<TenantResponse> tenants = tenantService.getAllTenants();
        return ResponseEntity.ok(tenants);
    }
    
    /**
     * Get active tenants only
     * Useful for dashboard showing current occupancy
     * 
     * @return List of active tenants
     */
    @GetMapping("/active")
    public ResponseEntity<List<TenantResponse>> getActiveTenants() {
        List<TenantResponse> tenants = tenantService.getActiveTenants();
        return ResponseEntity.ok(tenants);
    }
    
    /**
     * Get tenants for a specific property
     * SECURITY: Validates property ownership first
     * 
     * @param propertyId Property ID
     * @return List of tenants for that property
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<TenantResponse>> getTenantsByProperty(@PathVariable Long propertyId) {
        // Service validates property ownership before returning tenants
        List<TenantResponse> tenants = tenantService.getTenantsByProperty(propertyId);
        return ResponseEntity.ok(tenants);
    }
    
    /**
     * Get tenants for a specific room
     * SECURITY: Validates room ownership first
     * 
     * @param roomId Room ID
     * @return List of tenants in that room
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<TenantResponse>> getTenantsByRoom(@PathVariable Long roomId) {
        // Service validates room ownership before returning tenants
        List<TenantResponse> tenants = tenantService.getTenantsByRoom(roomId);
        return ResponseEntity.ok(tenants);
    }
    
    /**
     * Get a specific tenant by ID
     * Access denied if tenant doesn't belong to current owner's property
     * 
     * @param id Tenant ID
     * @return Tenant details if owned by current user
     */
    @GetMapping("/{id}")
    public ResponseEntity<TenantResponse> getTenantById(@PathVariable Long id) {
        // OwnerId extracted from JWT - validates ownership
        TenantResponse tenant = tenantService.getTenantById(id);
        return ResponseEntity.ok(tenant);
    }
    
    /**
     * Update a tenant
     * Only allowed if tenant belongs to current owner's property
     * 
     * @param id Tenant ID
     * @param request Updated tenant data
     * @return Updated tenant
     */
    @PutMapping("/{id}")
    public ResponseEntity<TenantResponse> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody TenantRequest request) {
        // OwnerId extracted from JWT - validates ownership before update
        TenantResponse updated = tenantService.updateTenant(id, request);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Update tenant status (e.g., mark as INACTIVE when they move out)
     * 
     * @param id Tenant ID
     * @param status New status (ACTIVE or INACTIVE)
     * @return Updated tenant
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TenantResponse> updateTenantStatus(
            @PathVariable Long id,
            @RequestParam TenantStatus status) {
        TenantResponse updated = tenantService.updateTenantStatus(id, status);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete a tenant
     * Only allowed if tenant belongs to current owner's property
     * 
     * @param id Tenant ID
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        // OwnerId extracted from JWT - validates ownership before deletion
        tenantService.deleteTenant(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get count of active tenants (for dashboard)
     * 
     * @return Count of active tenants
     */
    @GetMapping("/count/active")
    public ResponseEntity<Long> countActiveTenants() {
        Long count = tenantService.countActiveTenants();
        return ResponseEntity.ok(count);
    }
    
    /**
     * Export all tenants to CSV
     * 
     * @return CSV file with all tenants
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTenants() {
        List<TenantResponse> tenants = tenantService.getAllTenants();
        byte[] csvData = csvExportUtil.exportTenantsToCsv(tenants);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "tenants.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
