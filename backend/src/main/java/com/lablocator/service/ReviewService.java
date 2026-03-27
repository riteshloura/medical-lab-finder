package com.lablocator.service;

import com.lablocator.dto.review.BookingReviewResponse;
import com.lablocator.dto.review.CreateReviewRequest;
import com.lablocator.dto.review.GetLabReviewsResponse;
import com.lablocator.dto.review.UserResponse;
import com.lablocator.exceptions.AccessDeniedException;
import com.lablocator.exceptions.BadRequestException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.*;
import com.lablocator.repository.BookingRepo;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.ReviewRepo;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewService {
    @Autowired
    ReviewRepo reviewRepo;
    @Autowired
    UserRepo userRepo;
    @Autowired
    LabRepo labRepo;
    @Autowired
    BookingRepo bookingRepo;

    public BookingReviewResponse createLabReview(Long bookingId, String email, CreateReviewRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot review this booking");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Booking not completed");
        }

        validateReviewPayload(req);

        if (reviewRepo.existsByBookingId(bookingId)) {
            throw new BadRequestException("Review already exists");
        }

        Lab lab = booking.getLab();

        Review review = new Review();
        review.setBooking(booking);
        review.setUser(user);
        review.setComment(req.review().trim());
        review.setRating(req.rating());
        review.setLab(lab);

        Review savedReview = reviewRepo.save(review);

        updateLabRating(lab.getId());

        return mapToBookingReviewResponse(savedReview);
    }

    public BookingReviewResponse getBookingReview(Long bookingId, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot view this review");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Booking not completed");
        }

        Review review = reviewRepo.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        return mapToBookingReviewResponse(review);
    }

    public BookingReviewResponse updateLabReview(Long bookingId, String email, CreateReviewRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot edit this review");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Booking not completed");
        }

        validateReviewPayload(req);

        Review review = reviewRepo.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setComment(req.review().trim());
        review.setRating(req.rating());

        Review saved = reviewRepo.save(review);
        updateLabRating(booking.getLab().getId());

        return mapToBookingReviewResponse(saved);
    }

    @Transactional
    public void updateLabRating(Long labId) {

        Lab lab = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab not found"));

        Double avgRating = reviewRepo.getAverageRatingByLabId(labId);
        Long totalReviews = reviewRepo.countReviewsByLabId(labId);

        lab.setAvgRating(avgRating != null ? avgRating : 0.0);
        lab.setTotalReviews(totalReviews != null ? totalReviews.intValue() : 0);

        labRepo.save(lab);
    }

    public List<GetLabReviewsResponse> getLabReviews(Long labId) {
        List<Review> review = reviewRepo.findAllByLabId(labId);

        List<GetLabReviewsResponse> res = new ArrayList<>();

        for (Review r : review) {
            res.add(new GetLabReviewsResponse(
                    r.getId(),
                    r.getComment(),
                    r.getRating(),
                    new UserResponse(
                            r.getUser().getName(),
                            r.getUser().getId(),
                            r.getUser().getEmail()
                    ),
                    r.getCreatedAt()
            ));
        }

        return res;
    }

    private void validateReviewPayload(CreateReviewRequest req) {
        if (req.rating() == null || req.rating() < 1 || req.rating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }
        if (req.review() == null || req.review().trim().isEmpty()) {
            throw new BadRequestException("Review comment is required");
        }
    }

    private BookingReviewResponse mapToBookingReviewResponse(Review review) {
        return new BookingReviewResponse(
                review.getId(),
                review.getComment(),
                review.getRating(),
                review.getCreatedAt()
        );
    }
}
