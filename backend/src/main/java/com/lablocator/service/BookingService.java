package com.lablocator.service;

import com.lablocator.dto.booking.testResponse.BookingTestResponse;
import com.lablocator.dto.booking.CreateBookingRequest;
import com.lablocator.dto.booking.testResponse.GetUserBookingResponse;
import com.lablocator.dto.booking.testResponse.LabResponse;
import com.lablocator.dto.review.UserResponse;
import com.lablocator.exceptions.BadRequestException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.*;
import com.lablocator.repository.BookingRepo;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.LabTestRepo;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {
    @Autowired private BookingRepo bookingRepo;
    @Autowired private UserRepo userRepo;
    @Autowired private LabRepo labRepo;
    @Autowired private LabTestRepo labTestRepo;


    @Transactional
    public Booking createBooking(Long labId, String email, CreateBookingRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Lab lab = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab", labId));

        if (req.testIds() == null || req.testIds().isEmpty()) {
            throw new BadRequestException("At least one test must be selected to create a booking");
        }

        if((lab.getSlotCapacityOnline()-req.testIds().size()) < 0) {
            throw new BadRequestException("Insufficient available slots");
        }

        Booking booking = Booking.builder()
                .user(user)
                .lab(lab)
                .timeSlot(req.timeSlot())
                .status(BookingStatus.PENDING)
                .build();

        List<BookingTest> bookingTests = new ArrayList<>();
        for (Long testId : req.testIds()) {
            LabTest labTest = labTestRepo.findByLabIdAndTestId(labId, testId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Test with id " + testId + " is not available in this lab"));

            BookingTest bookingTest = BookingTest.builder()
                    .priceAtBooking(labTest.getPrice())
                    .booking(booking)
                    .labTest(labTest)
                    .build();
            bookingTests.add(bookingTest);
        }

        booking.setBookingTests(bookingTests);

        booking = bookingRepo.save(booking);

        int newSlotCapacity = lab.getSlotCapacityOnline()-req.testIds().size();
        lab.setSlotCapacityOnline(newSlotCapacity);

        labRepo.save(lab);

        return booking;
    }

    public List<GetUserBookingResponse> getUserBooking(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Booking> booking = bookingRepo.findAllByUserIdOrderByBookingDateDesc(user.getId());

        List<GetUserBookingResponse> res = new ArrayList<>();

        for(Booking b: booking) {
            List<BookingTestResponse> bookingTestResponse = new ArrayList<>();

            for (BookingTest bt : b.getBookingTests()) {
                bookingTestResponse.add(new BookingTestResponse(
                        bt.getId(),
                        bt.getLabTest().getTest().getName(),
                        bt.getPriceAtBooking()
                ));
            }

            res.add(new GetUserBookingResponse(
                    b.getId(),
                    b.getStatus(),
                    bookingTestResponse,
                    new LabResponse(
                            b.getLab().getId(),
                            b.getLab().getName(),
                            b.getLab().getCity()
                    ),
                    new UserResponse(
                            user.getName(),
                            user.getId(),
                            user.getEmail()
                    ),
                    b.getTimeSlot(),
                    b.getCreatedAt()
            ));
        }

        return res;
    }

    public List<GetUserBookingResponse> getLabBooking(String email) {
        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Booking> booking = bookingRepo.findAllByLabOwnerId(labOwner.getId());

        List<GetUserBookingResponse> res = new ArrayList<>();

        for(Booking b: booking) {
            List<BookingTestResponse> bookingTestResponse = new ArrayList<>();

            for (BookingTest bt : b.getBookingTests()) {
                bookingTestResponse.add(new BookingTestResponse(
                        bt.getId(),
                        bt.getLabTest().getTest().getName(),
                        bt.getPriceAtBooking()
                ));
            }

            res.add(new GetUserBookingResponse(
                    b.getId(),
                    b.getStatus(),
                    bookingTestResponse,
                    new LabResponse(
                            b.getLab().getId(),
                            b.getLab().getName(),
                            b.getLab().getCity()
                    ),
                    new UserResponse(
                            labOwner.getName(),
                            labOwner.getId(),
                            labOwner.getEmail()
                    ),
                    b.getTimeSlot(),
                    b.getCreatedAt()
            ));
        }

        return res;
    }

    public Booking updateBookingStatus(Long bookingId, String email, String status) {
        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepo.findByIdAndLabOwnerId(bookingId, labOwner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        try {
            booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid booking status: '" + status + "'. Allowed values: PENDING, CONFIRMED, COMPLETED, CANCELLED");
        }

        return bookingRepo.save(booking);
    }

    public List<Booking> getLabBookingByLabId(Long labId, String email) {
        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepo.findByLabIdAndLabOwnerId(labId, labOwner.getId());
    }
}
