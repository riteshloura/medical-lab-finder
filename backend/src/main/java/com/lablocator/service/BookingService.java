package com.lablocator.service;

import com.lablocator.dto.booking.CreateBookingRequest;
import com.lablocator.model.*;
import com.lablocator.repository.BookingRepo;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.LabTestRepo;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
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
}
