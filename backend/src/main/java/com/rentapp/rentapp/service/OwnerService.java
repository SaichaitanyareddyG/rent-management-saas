package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.OwnerRequest;
import com.rentapp.rentapp.dto.OwnerResponse;
import com.rentapp.rentapp.dto.UpdateOwnerProfileRequest;
import com.rentapp.rentapp.entity.Owner;
import com.rentapp.rentapp.mapper.OwnerMapper;
import com.rentapp.rentapp.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerService {
    
    private final OwnerRepository ownerRepository;
    private final OwnerMapper ownerMapper;
    private final PasswordEncoder passwordEncoder;
    
    public OwnerResponse createOwner(OwnerRequest request) {
        Owner owner = ownerMapper.toEntity(request);
        owner.setPassword(passwordEncoder.encode(request.getPassword()));
        Owner savedOwner = ownerRepository.save(owner);
        return ownerMapper.toResponse(savedOwner);
    }
    
    public List<OwnerResponse> getAllOwners() {
        return ownerRepository.findAll().stream()
                .map(ownerMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public Owner findByEmail(String email) {
        return ownerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner not found with email: " + email));
    }
    
    public String generateResetToken(String email) {
        Owner owner = findByEmail(email);
        String token = UUID.randomUUID().toString();
        owner.setResetToken(token);
        owner.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Token valid for 1 hour
        ownerRepository.save(owner);
        return token;
    }
    
    public void resetPassword(String token, String newPassword) {
        Owner owner = ownerRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));
        
        if (owner.getResetTokenExpiry() == null || owner.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }
        
        owner.setPassword(passwordEncoder.encode(newPassword));
        owner.setResetToken(null);
        owner.setResetTokenExpiry(null);
        ownerRepository.save(owner);
    }
    
    public OwnerResponse getProfile(String email) {
        Owner owner = findByEmail(email);
        return ownerMapper.toResponse(owner);
    }
    
    public OwnerResponse updateProfile(String email, UpdateOwnerProfileRequest request) {
        Owner owner = findByEmail(email);
        
        // Check if email is being changed to one that already exists
        if (!owner.getEmail().equals(request.getEmail())) {
            ownerRepository.findByEmail(request.getEmail())
                    .ifPresent(existing -> {
                        throw new RuntimeException("Email already in use");
                    });
        }
        
        owner.setName(request.getName());
        owner.setEmail(request.getEmail());
        owner.setPhone(request.getPhone());
        
        Owner updatedOwner = ownerRepository.save(owner);
        return ownerMapper.toResponse(updatedOwner);
    }
    
    public void changePassword(String email, String currentPassword, String newPassword) {
        Owner owner = findByEmail(email);
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, owner.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Update to new password
        owner.setPassword(passwordEncoder.encode(newPassword));
        ownerRepository.save(owner);
    }
}
