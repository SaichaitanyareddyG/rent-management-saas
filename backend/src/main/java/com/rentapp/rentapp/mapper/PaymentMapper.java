package com.rentapp.rentapp.mapper;

import com.rentapp.rentapp.dto.PaymentResponse;
import com.rentapp.rentapp.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    
    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
            payment.getId(),
            payment.getAmount(),
            payment.getMonth(),
            payment.getStatus(),
            payment.getUtr(),
            payment.getNotes(),
            payment.getTenant().getId(),
            payment.getTenant().getName(),
            payment.getTenant().getProperty().getId(),
            payment.getTenant().getProperty().getName(),
            payment.getTenant().getRoom().getId(),
            payment.getTenant().getRoom().getRoomNumber(),
            payment.getCreatedAt(),
            payment.getUpdatedAt(),
            payment.getPaidAt()
        );
    }
}
