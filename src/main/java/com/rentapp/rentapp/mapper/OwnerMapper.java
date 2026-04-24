package com.rentapp.rentapp.mapper;

import com.rentapp.rentapp.dto.OwnerRequest;
import com.rentapp.rentapp.dto.OwnerResponse;
import com.rentapp.rentapp.entity.Owner;
import org.springframework.stereotype.Component;

@Component
public class OwnerMapper {
    
    public Owner toEntity(OwnerRequest request) {
        Owner owner = new Owner();
        owner.setName(request.getName());
        owner.setEmail(request.getEmail());
        owner.setPassword(request.getPassword());
        owner.setPhone(request.getPhone());
        return owner;
    }
    
    public OwnerResponse toResponse(Owner owner) {
        return new OwnerResponse(
            owner.getId(),
            owner.getName(),
            owner.getEmail(),
            owner.getPhone()
        );
    }
}
