package com.lablocator.dto.user;

import com.lablocator.model.Role;

import java.time.LocalDateTime;

public record GetUserResponse(
        Long id,
        String name,
        String email,
        Boolean isVerified,
        Role role,
        LocalDateTime createdAt
) {
}
