package com.lablocator.service;

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

    public Object createLabReview(Long bookingId, String email, CreateReviewRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if(!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot review this booking");
        }

        if(booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Booking not completed");
        }

        if (reviewRepo.existsByBookingId(bookingId)) {
            throw new BadRequestException("Review already exists");
        }

        Lab lab = booking.getLab();

        Review review = new Review();
        review.setBooking(booking);
        review.setUser(user);
        review.setComment(req.review());
        review.setRating(req.rating());
        review.setLab(lab);

        Review savedReview = reviewRepo.save(review);

        updateLabRating(lab.getId());

        return savedReview;
    }

    public void updateLabRating(Long labId) {

        Lab lab = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab not found"));

        Double avgRating = reviewRepo.getAverageRatingByLabId(labId);
        Long totalReviews = reviewRepo.countReviewsByLabId(labId);

        // handle null (no reviews case)
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
}
