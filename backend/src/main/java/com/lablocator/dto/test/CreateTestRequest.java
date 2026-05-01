package com.lablocator.dto.test;

import jakarta.validation.constraints.NotBlank;

public record CreateTestRequest(
        @NotBlank(message = "Test name is required")
        String name,

        String description
) {
}
