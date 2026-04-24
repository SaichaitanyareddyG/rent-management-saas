package com.rentapp.rentapp.controller;

import com.rentapp.rentapp.dto.ChangePasswordRequest;
import com.rentapp.rentapp.dto.MessageResponse;
import com.rentapp.rentapp.dto.OwnerRequest;
import com.rentapp.rentapp.dto.OwnerResponse;
import com.rentapp.rentapp.dto.UpdateOwnerProfileRequest;
import com.rentapp.rentapp.security.SecurityContextUtil;
import com.rentapp.rentapp.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/owners")
@RequiredArgsConstructor
public class OwnerController {
    
    private final OwnerService ownerService;
    private final SecurityContextUtil securityContextUtil;
    
    @PostMapping
    public ResponseEntity<OwnerResponse> createOwner(@Valid @RequestBody OwnerRequest request) {
        OwnerResponse createdOwner = ownerService.createOwner(request);
        return new ResponseEntity<>(createdOwner, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<OwnerResponse>> getAllOwners() {
        List<OwnerResponse> owners = ownerService.getAllOwners();
        return ResponseEntity.ok(owners);
    }
    
    @GetMapping("/profile")
    public ResponseEntity<OwnerResponse> getProfile() {
        String email = securityContextUtil.getCurrentUserEmail();
        OwnerResponse profile = ownerService.getProfile(email);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<OwnerResponse> updateProfile(@Valid @RequestBody UpdateOwnerProfileRequest request) {
        String email = securityContextUtil.getCurrentUserEmail();
        OwnerResponse updatedProfile = ownerService.updateProfile(email, request);
        return ResponseEntity.ok(updatedProfile);
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = securityContextUtil.getCurrentUserEmail();
        ownerService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }
}
