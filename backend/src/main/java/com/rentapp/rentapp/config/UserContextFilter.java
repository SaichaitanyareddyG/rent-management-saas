package com.rentapp.rentapp.config;

import com.rentapp.rentapp.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * UserContextFilter - Extracts user information from JWT and adds to MDC
 * MDC (Mapped Diagnostic Context) allows thread-safe logging with user context
 */
@Component
@RequiredArgsConstructor
public class UserContextFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            // Extract JWT token from Authorization header
            String authHeader = request.getHeader("Authorization");
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                try {
                    // Extract user information from token
                    String email = jwtUtil.extractEmail(token);
                    Long ownerId = jwtUtil.extractOwnerId(token);
                    
                    // Add to MDC for logging
                    MDC.put("userId", email);
                    MDC.put("ownerId", String.valueOf(ownerId));
                } catch (Exception e) {
                    // Token might be invalid, but don't stop the request
                    // Security filter will handle authentication
                }
            }
            
            // Add request information to MDC
            MDC.put("requestId", generateRequestId());
            MDC.put("clientIp", getClientIp(request));
            MDC.put("userAgent", request.getHeader("User-Agent"));
            
            filterChain.doFilter(request, response);
            
        } finally {
            // Always clear MDC after request to prevent memory leaks
            MDC.clear();
        }
    }
    
    private String generateRequestId() {
        return java.util.UUID.randomUUID().toString();
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
