package com.lablocator.dto.review;

import java.time.LocalDateTime;

public record BookingReviewResponse(
        Long id,
        String review,
        Integer rating,
        LocalDateTime createdAt
) {
}
