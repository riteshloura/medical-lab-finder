package com.lablocator.dto.review;

public record CreateReviewRequest(
        String review,
        Integer rating
) {
}
