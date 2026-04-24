package com.rentapp.rentapp.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.rentapp.rentapp.dto.ForgotPasswordRequest;
import com.rentapp.rentapp.dto.GoogleLoginRequest;
import com.rentapp.rentapp.dto.LoginRequest;
import com.rentapp.rentapp.dto.LoginResponse;
import com.rentapp.rentapp.dto.OwnerResponse;
import com.rentapp.rentapp.dto.ResetPasswordRequest;
import com.rentapp.rentapp.entity.AuthProvider;
import com.rentapp.rentapp.entity.Owner;
import com.rentapp.rentapp.mapper.OwnerMapper;
import com.rentapp.rentapp.repository.OwnerRepository;
import com.rentapp.rentapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final OwnerService ownerService;
    private final OwnerMapper ownerMapper;
    private final GoogleAuthService googleAuthService;
    private final OwnerRepository ownerRepository;
    private final PasswordEncoder passwordEncoder;
    
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        Owner owner = ownerService.findByEmail(request.getEmail());
        String token = jwtUtil.generateToken(owner.getEmail(), owner.getId());
        OwnerResponse ownerResponse = ownerMapper.toResponse(owner);
        
        return new LoginResponse(token, ownerResponse);
    }
    
    public String forgotPassword(ForgotPasswordRequest request) {
        try {
            String token = ownerService.generateResetToken(request.getEmail());
            // In production, send email with reset link here
            // For now, we'll return the token to display in UI
            log.info("Password reset token generated for email: {}", request.getEmail());
            return token;
        } catch (RuntimeException e) {
            // Don't reveal if email exists or not for security
            log.warn("Password reset requested for non-existent email: {}", request.getEmail());
            return "success"; // Return generic success message
        }
    }
    
    public void resetPassword(ResetPasswordRequest request) {
        ownerService.resetPassword(request.getToken(), request.getNewPassword());
    }
    
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        // Verify Google ID token
        GoogleIdToken.Payload payload = googleAuthService.verifyToken(request.getIdToken());
        if (payload == null) {
            throw new RuntimeException("Invalid Google ID token");
        }
        
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        
        // Check if user exists with this Google ID
        Optional<Owner> existingByGoogleId = ownerRepository.findByGoogleId(googleId);
        if (existingByGoogleId.isPresent()) {
            Owner owner = existingByGoogleId.get();
            
            // Update phone if provided during profile completion
            if (request.getPhone() != null && !request.getPhone().isBlank()) {
                owner.setPhone(request.getPhone());
                owner.setProfileComplete(true);
                ownerRepository.save(owner);
            }
            
            String token = jwtUtil.generateToken(owner.getEmail(), owner.getId());
            OwnerResponse ownerResponse = ownerMapper.toResponse(owner);
            return new LoginResponse(token, ownerResponse);
        }
        
        // Check if user exists with this email (account linking)
        Optional<Owner> existingByEmail = ownerRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            Owner owner = existingByEmail.get();
            // Link Google account to existing account
            owner.setGoogleId(googleId);
            owner.setAuthProvider(AuthProvider.GOOGLE);
            ownerRepository.save(owner);
            
            String token = jwtUtil.generateToken(owner.getEmail(), owner.getId());
            OwnerResponse ownerResponse = ownerMapper.toResponse(owner);
            return new LoginResponse(token, ownerResponse);
        }
        
        // Create new user with Google auth
        Owner newOwner = new Owner();
        newOwner.setName(name);
        newOwner.setEmail(email);
        newOwner.setGoogleId(googleId);
        newOwner.setAuthProvider(AuthProvider.GOOGLE);
        newOwner.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString())); // Random password
        
        // Check if phone is provided
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            newOwner.setPhone(request.getPhone());
            newOwner.setProfileComplete(true);
        } else {
            newOwner.setPhone(""); // Will be filled later
            newOwner.setProfileComplete(false);
        }
        
        Owner savedOwner = ownerRepository.save(newOwner);
        String token = jwtUtil.generateToken(savedOwner.getEmail(), savedOwner.getId());
        OwnerResponse ownerResponse = ownerMapper.toResponse(savedOwner);
        
        return new LoginResponse(token, ownerResponse);
    }
}
