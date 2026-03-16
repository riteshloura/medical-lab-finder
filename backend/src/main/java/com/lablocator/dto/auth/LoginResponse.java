package com.lablocator.dto.auth;

public record LoginResponse(
        String name,
        String userId,
        String token,
        String email,
        String role
) {
}
