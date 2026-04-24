package com.rentapp.rentapp.exception;

/**
 * UnauthorizedException - Thrown for unauthorized access
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
}
