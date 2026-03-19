package com.lablocator.repository;

import com.lablocator.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Long> {
    List<Review> findAllByLabId(Long labId);

    boolean existsByBookingId(Long bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.lab.id = :labId")
    Double getAverageRatingByLabId(Long labId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.lab.id = :labId")
    Long countReviewsByLabId(Long labId);
}
