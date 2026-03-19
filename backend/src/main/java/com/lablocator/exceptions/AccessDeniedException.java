package com.lablocator.exceptions;

/** Thrown when the authenticated user is not authorised to perform an action (→ 403). */
public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}
