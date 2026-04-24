package com.rentapp.rentapp.exception;

/**
 * Thrown when attempting an operation on a tenant with invalid status
 */
public class InvalidTenantStatusException extends RuntimeException {
    public InvalidTenantStatusException(String message) {
        super(message);
    }
}
