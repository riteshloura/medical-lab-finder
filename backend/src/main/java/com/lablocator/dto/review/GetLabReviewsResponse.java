package com.lablocator.dto.review;

import java.time.LocalDateTime;

public record GetLabReviewsResponse(
        Long rId,
        String review,
        UserResponse user,
        LocalDateTime uploaded_at
) {
}
