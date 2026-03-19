package com.lablocator.controllers;

import com.lablocator.dto.review.CreateReviewRequest;
import com.lablocator.dto.review.GetLabReviewsResponse;
import com.lablocator.model.Review;
import com.lablocator.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @GetMapping("/lab/{labId}/review")
    public ResponseEntity<List<GetLabReviewsResponse>> getLabReviews(@PathVariable Long labId) {
        return ResponseEntity.ok(reviewService.getLabReviews(labId));
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/booking/{bookingId}/review")
    public ResponseEntity<?> createLabReview(@PathVariable Long bookingId,
                                             Authentication authentication,
                                             @RequestBody CreateReviewRequest req) {
        return ResponseEntity.ok(reviewService.createLabReview(bookingId, authentication.getName(), req));
    }
}
