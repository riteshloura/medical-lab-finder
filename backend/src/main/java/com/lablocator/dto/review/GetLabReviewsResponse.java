package com.lablocator.dto.review;

import java.time.LocalDateTime;

public record GetLabReviewsResponse(
        Long id,
        String review,
        Integer rating,
        UserResponse user,
        LocalDateTime uploaded_at
) {
}
