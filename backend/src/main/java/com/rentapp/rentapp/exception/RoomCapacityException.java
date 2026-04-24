package com.rentapp.rentapp.exception;

/**
 * Thrown when attempting to add a tenant to a room that's already at capacity
 */
public class RoomCapacityException extends RuntimeException {
    public RoomCapacityException(String message) {
        super(message);
    }
}
