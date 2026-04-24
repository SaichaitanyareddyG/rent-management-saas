package com.rentapp.rentapp.exception;

/**
 * Thrown when attempting to create a duplicate payment for the same tenant and month
 */
public class DuplicatePaymentException extends RuntimeException {
    public DuplicatePaymentException(String message) {
        super(message);
    }
}
