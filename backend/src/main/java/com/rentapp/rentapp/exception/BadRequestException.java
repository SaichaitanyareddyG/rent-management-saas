package com.rentapp.rentapp.exception;

/**
 * BadRequestException - Thrown for invalid request data
 */
public class BadRequestException extends RuntimeException {
    
    public BadRequestException(String message) {
        super(message);
    }
}
