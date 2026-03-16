package com.lablocator.dto.booking;

import jakarta.validation.constraints.NotBlank;

public record UpdateBookingStatusRequest(
        @NotBlank(message = "Status is required")
        String status
) {
}
