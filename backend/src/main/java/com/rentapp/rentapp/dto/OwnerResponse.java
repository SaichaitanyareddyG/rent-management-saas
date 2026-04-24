package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnerResponse {
    
    private Long id;
    private String name;
    private String email;
    private String phone;
    // Note: Password is excluded from response for security
}
