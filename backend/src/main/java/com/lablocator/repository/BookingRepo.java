package com.lablocator.repository;

import com.lablocator.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepo extends JpaRepository<Booking, Long> {

    List<Booking> findAllByUserId(Long id);

    List<Booking> findAllByLabId(Long id);

    @Query("SELECT b FROM Booking b WHERE b.lab.owner.id = :ownerId ORDER BY b.createdAt DESC")
    List<Booking> findAllByLabOwnerId(Long ownerId);

    @Query("SELECT b FROM Booking b WHERE b.id = :bookingId AND b.lab.owner.id = :ownerId")
    Optional<Booking> findByIdAndLabOwnerId(Long bookingId, Long ownerId);
}
