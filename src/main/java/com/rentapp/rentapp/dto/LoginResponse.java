package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String token;
    private String type = "Bearer";
    private OwnerResponse owner;
    
    public LoginResponse(String token, OwnerResponse owner) {
        this.token = token;
        this.owner = owner;
    }
}
