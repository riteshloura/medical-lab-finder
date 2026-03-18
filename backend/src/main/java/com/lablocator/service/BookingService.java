package com.lablocator.service;

import com.lablocator.dto.booking.CreateBookingRequest;
import com.lablocator.model.*;
import com.lablocator.repository.BookingRepo;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.LabTestRepo;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepo bookingRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private LabRepo labRepo;
    @Autowired
    private LabTestRepo labTestRepo;

    public Booking createBooking(Long labId, String email, CreateBookingRequest req) {
        // 1. Fetch the user by email (from JWT/Auth)
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Fetch the lab
        Lab lab = labRepo.findById(labId)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        // 3. Build the Booking first (without tests)
        Booking booking = Booking.builder()
                .user(user)
                .lab(lab)
                .timeSlot(req.timeSlot())
                .status(BookingStatus.PENDING)
                .build();

        // 4. For each testId, find the LabTest for this specific lab and create a BookingTest
        List<BookingTest> bookingTests = new ArrayList<>();
        for (Long testId : req.testIds()) {
            LabTest labTest = labTestRepo.findByLabIdAndTestId(labId, testId)
                    .orElseThrow(() -> new RuntimeException("Test with id " + testId + " not available in this lab"));

            BookingTest bookingTest = BookingTest.builder()
                    .booking(booking)
                    .labTest(labTest)
                    .build();
            bookingTests.add(bookingTest);
        }

        // 5. Set the tests on the booking and save (CascadeType.ALL saves BookingTests too)
        booking.setBookingTests(bookingTests);
        return bookingRepo.save(booking);
    }

    public List<Booking> getUserBooking(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepo.findAllByUserId(user.getId());
    }

    public List<Booking> getLabBooking(String email) {
        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No Bookings found"));

        return bookingRepo.findAllByLabOwnerId(labOwner.getId());
    }

    public Booking updateBookingStatus(Long bookingId, String email, String status) {
        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepo.findByIdAndLabOwnerId(bookingId, labOwner.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        try {
            booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Invalid booking status");
        }

        return bookingRepo.save(booking);
    }

    public List<Booking> getLabBookingByLabId(Long labId, String email) {
        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepo.findByLabIdAndLabOwnerId(labId, labOwner.getId());
    }
}
