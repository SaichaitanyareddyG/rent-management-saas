package com.rentapp.rentapp.security;

import com.rentapp.rentapp.entity.Owner;
import com.rentapp.rentapp.service.OwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityContextUtil {
    
    private final OwnerService ownerService;
    
    /**
     * Get the currently authenticated owner's email from security context
     */
    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userDetails.getUsername();
        }
        
        throw new RuntimeException("No authenticated user found");
    }
    
    /**
     * Get the currently authenticated Owner entity
     */
    public Owner getCurrentOwner() {
        String email = getCurrentUserEmail();
        return ownerService.findByEmail(email);
    }
    
    /**
     * Get the currently authenticated owner's ID
     */
    public Long getCurrentOwnerId() {
        return getCurrentOwner().getId();
    }
    
    /**
     * Check if the current user is authenticated
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal());
    }
}
