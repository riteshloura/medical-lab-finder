package com.lablocator.dto.auth;

/**
 * Response returned after registration, indicating whether the verification email was sent.
 */
public record RegisterResponse(String message, boolean emailSent) {}
