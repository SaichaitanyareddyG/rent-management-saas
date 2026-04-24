package com.rentapp.rentapp.controller;

import com.rentapp.rentapp.dto.ForgotPasswordRequest;
import com.rentapp.rentapp.dto.LoginRequest;
import com.rentapp.rentapp.dto.LoginResponse;
import com.rentapp.rentapp.dto.MessageResponse;
import com.rentapp.rentapp.dto.OwnerRequest;
import com.rentapp.rentapp.dto.OwnerResponse;
import com.rentapp.rentapp.dto.ResetPasswordRequest;
import com.rentapp.rentapp.service.AuthService;
import com.rentapp.rentapp.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final OwnerService ownerService;
    
    @PostMapping("/register")
    public ResponseEntity<OwnerResponse> register(@Valid @RequestBody OwnerRequest request) {
        OwnerResponse owner = ownerService.createOwner(request);
        return new ResponseEntity<>(owner, HttpStatus.CREATED);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String token = authService.forgotPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the email exists, a password reset link has been sent");
        response.put("resetToken", token); // In production, don't return this - send via email
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(new MessageResponse("Password reset successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}
