package com.lablocator.exceptions;

/** Thrown when an operation would create a duplicate / conflicting record (→ 409). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
