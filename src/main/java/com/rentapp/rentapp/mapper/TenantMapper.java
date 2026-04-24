package com.rentapp.rentapp.mapper;

import com.rentapp.rentapp.dto.TenantRequest;
import com.rentapp.rentapp.dto.TenantResponse;
import com.rentapp.rentapp.entity.Tenant;
import com.rentapp.rentapp.enums.TenantStatus;
import org.springframework.stereotype.Component;

@Component
public class TenantMapper {
    
    /**
     * Mask Aadhar number - show only last 4 digits
     * Example: 123456789012 → XXXX-XXXX-9012
     */
    private String maskAadhar(String aadhar) {
        if (aadhar == null || aadhar.length() != 12) {
            return aadhar;
        }
        return "XXXX-XXXX-" + aadhar.substring(8);
    }
    
    public Tenant toEntity(TenantRequest request) {
        Tenant tenant = new Tenant();
        tenant.setName(request.getName());
        tenant.setPhone(request.getPhone());
        tenant.setEmail(request.getEmail());
        tenant.setNativeAddress(request.getNativeAddress());
        tenant.setCompanyOrCollege(request.getCompanyOrCollege());
        tenant.setEmergencyContact(request.getEmergencyContact());
        tenant.setGuardianName(request.getGuardianName());
        tenant.setAadharNumber(request.getAadharNumber());  // Store as-is
        tenant.setRentAmount(request.getRentAmount());
        tenant.setJoiningDate(request.getJoiningDate());
        tenant.setRentDueDay(request.getRentDueDay());
        tenant.setAdvanceAmount(request.getAdvanceAmount() != null ? request.getAdvanceAmount() : 0.0);
        tenant.setNotes(request.getNotes());
        tenant.setStatus(TenantStatus.ACTIVE); // Default status
        return tenant;
    }
    
    public TenantResponse toResponse(Tenant tenant) {
        return new TenantResponse(
            tenant.getId(),
            tenant.getName(),
            tenant.getPhone(),
            tenant.getEmail(),
            tenant.getNativeAddress(),
            tenant.getCompanyOrCollege(),
            tenant.getEmergencyContact(),
            tenant.getGuardianName(),
            maskAadhar(tenant.getAadharNumber()),  // Masked for security
            tenant.getRentAmount(),
            tenant.getStatus(),
            tenant.getJoiningDate(),
            tenant.getRentDueDay(),
            tenant.getAdvanceAmount(),
            tenant.getNotes(),
            tenant.getProperty().getId(),
            tenant.getProperty().getName(),
            tenant.getRoom().getId(),
            tenant.getRoom().getRoomNumber(),
            tenant.getCreatedAt(),
            tenant.getUpdatedAt()
        );
    }
    
    public void updateEntity(Tenant tenant, TenantRequest request) {
        tenant.setName(request.getName());
        tenant.setPhone(request.getPhone());
        
        if (request.getEmail() != null) {
            tenant.setEmail(request.getEmail());
        }
        if (request.getNativeAddress() != null) {
            tenant.setNativeAddress(request.getNativeAddress());
        }
        if (request.getCompanyOrCollege() != null) {
            tenant.setCompanyOrCollege(request.getCompanyOrCollege());
        }
        if (request.getEmergencyContact() != null) {
            tenant.setEmergencyContact(request.getEmergencyContact());
        }
        if (request.getGuardianName() != null) {
            tenant.setGuardianName(request.getGuardianName());
        }
        if (request.getAadharNumber() != null) {
            tenant.setAadharNumber(request.getAadharNumber());
        }
        
        tenant.setRentAmount(request.getRentAmount());
        tenant.setJoiningDate(request.getJoiningDate());
        tenant.setRentDueDay(request.getRentDueDay());
        
        if (request.getAdvanceAmount() != null) {
            tenant.setAdvanceAmount(request.getAdvanceAmount());
        }
        if (request.getNotes() != null) {
            tenant.setNotes(request.getNotes());
        }
    }
}
