package com.lablocator.exceptions;

/** Thrown for invalid client input that is not a validation failure (→ 400). */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
