package com.rentapp.rentapp.service;

import com.rentapp.rentapp.dto.ForgotPasswordRequest;
import com.rentapp.rentapp.dto.LoginRequest;
import com.rentapp.rentapp.dto.LoginResponse;
import com.rentapp.rentapp.dto.OwnerResponse;
import com.rentapp.rentapp.dto.ResetPasswordRequest;
import com.rentapp.rentapp.entity.Owner;
import com.rentapp.rentapp.mapper.OwnerMapper;
import com.rentapp.rentapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final OwnerService ownerService;
    private final OwnerMapper ownerMapper;
    
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
}
