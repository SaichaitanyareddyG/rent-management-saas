package com.rentapp.rentapp.enums;

public enum PaymentIntentStatus {
    // Legacy statuses (used by PaymentService)
    INITIATED,   // Payment initiated, awaiting confirmation
    COMPLETED,   // Payment confirmed by user
    
    // Verification system statuses (used by PaymentIntentService)
    ACTIVE,      // Intent created, waiting for UTR
    CANCELLED,   // Cancelled by new intent creation
    USED,        // Successfully used for payment
    EXPIRED      // Expired after 10 minutes
}
