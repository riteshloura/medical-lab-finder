package com.lablocator.service;

import com.lablocator.dto.booking.CancelBookingByUserRequest;
import com.lablocator.dto.booking.UpdateBookingStatusRequest;
import com.lablocator.dto.booking.testResponse.BookingTestResponse;
import com.lablocator.dto.booking.CreateBookingRequest;
import com.lablocator.dto.booking.testResponse.GetUserBookingResponse;
import com.lablocator.dto.booking.testResponse.LabResponse;
import com.lablocator.dto.review.UserResponse;
import com.lablocator.exceptions.AccessDeniedException;
import com.lablocator.exceptions.BadRequestException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.*;
import com.lablocator.repository.BookingRepo;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.LabTestRepo;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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


    @Transactional
    public Booking createBooking(Long labId, String email, CreateBookingRequest req) {
        // Validate Booking Date
        LocalDate today = LocalDate.now();
        LocalDate bookingDate = req.bookingDate().toLocalDate();

        if (!(bookingDate.equals(today) || bookingDate.equals(today.plusDays(1)))) {
            throw new BadRequestException("Booking date must be today or tomorrow");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Lab lab = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab", labId));

        if (req.testIds() == null || req.testIds().isEmpty()) {
            throw new BadRequestException("At least one test must be selected to create a booking");
        }

        if ((lab.getSlotCapacityOnline() - req.testIds().size()) < 0) {
            throw new BadRequestException("Insufficient available slots");
        }

        // Validate Time Slot
        LocalTime timeSlot = req.timeSlot();

        if (timeSlot.getMinute() % 30 != 0) {
            throw new BadRequestException("Invalid time slot. Must be in 30-minute intervals");
        }

        if (timeSlot.isBefore(lab.getOpeningTime()) || timeSlot.isAfter(lab.getClosingTime())) {
            throw new BadRequestException("Time slot must be within lab operating hours");
        }

        // Prevent past time booking (for today)
        if (bookingDate.equals(today)) {
            LocalTime now = LocalTime.now();

            if (timeSlot.isBefore(now)) {
                throw new BadRequestException("Time slot cannot be in the past");
            }
        }

        Booking booking = Booking.builder()
                .user(user)
                .lab(lab)
                .bookingDate(req.bookingDate())
                .timeSlot(req.timeSlot())
                .status(BookingStatus.PENDING)
                .statusUpdatedAt(LocalDateTime.now())
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

        int newSlotCapacity = lab.getSlotCapacityOnline() - req.testIds().size();
        lab.setSlotCapacityOnline(newSlotCapacity);

        labRepo.save(lab);

        return booking;
    }

    public List<GetUserBookingResponse> getUserBooking(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Booking> booking = bookingRepo.findAllByUserIdOrderByBookingDateDesc(user.getId());

        List<GetUserBookingResponse> res = new ArrayList<>();

        for (Booking b : booking) {
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
                    b.getCreatedAt(),
                    b.getCancellationReason(),
                    b.getStatusUpdatedAt()
            ));
        }

        return res;
    }

    public List<GetUserBookingResponse> getLabBooking(String email) {
        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Booking> booking = bookingRepo.findAllByLabOwnerId(labOwner.getId());

        List<GetUserBookingResponse> res = new ArrayList<>();

        for (Booking b : booking) {
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
                            b.getUser().getName(),
                            b.getUser().getId(),
                            b.getUser().getEmail()
//                            b.getUser().
//                            labOwner.getName(),
//                            labOwner.getId(),
//                            labOwner.getEmail()
                    ),
                    b.getTimeSlot(),
                    b.getCreatedAt(),
                    b.getCancellationReason(),
                    b.getStatusUpdatedAt()
            ));
        }

        return res;
    }

    @Transactional
    public Booking updateBookingStatus(Long bookingId, String email, UpdateBookingStatusRequest req) {

        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepo.findByIdAndLabOwnerId(bookingId, labOwner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        BookingStatus currentStatus = booking.getStatus();
        BookingStatus newStatus;

        try {
            newStatus = BookingStatus.valueOf(req.status().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid booking status: '" + req.status() +
                            "'. Allowed values: PENDING, CONFIRMED, COMPLETED, CANCELLED"
            );
        }

        // 🚨 Terminal states (no further changes allowed)
        if (currentStatus == BookingStatus.COMPLETED || currentStatus == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status once booking is " + currentStatus);
        }

        // 🔄 Valid transitions
        boolean isValidTransition =
                (currentStatus == BookingStatus.PENDING && (newStatus == BookingStatus.CONFIRMED || newStatus == BookingStatus.CANCELLED)) ||
                        (currentStatus == BookingStatus.CONFIRMED && (newStatus == BookingStatus.COMPLETED || newStatus == BookingStatus.CANCELLED));

        if (!isValidTransition) {
            throw new BadRequestException(
                    "Invalid status transition from " + currentStatus + " to " + newStatus
            );
        }

        // ❗ Cancellation reason validation (for LAB_OWNER)
        if (newStatus == BookingStatus.CANCELLED) {
            if (req.cancellationReason() == null || req.cancellationReason().isBlank()) {
                throw new BadRequestException("Cancellation reason is required");
            }

            booking.setCancellationReason(req.cancellationReason());
            booking.setCancelledBy(CancelledBy.LAB_OWNER);

            Lab lab = booking.getLab();
            lab.setSlotCapacityOnline(
                    lab.getSlotCapacityOnline() + booking.getBookingTests().size()
            );
            labRepo.save(lab);
        }

        // ✅ Update status
        booking.setStatus(newStatus);
        booking.setStatusUpdatedAt(LocalDateTime.now());

        return bookingRepo.save(booking);
    }

    public List<Booking> getLabBookingByLabId(Long labId, String email) {
        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepo.findByLabIdAndLabOwnerId(labId, labOwner.getId());
    }

    @Transactional
    public Object cancelBookingByUser(Long bookingId, String email, CancelBookingByUserRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking does not exist"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot cancel this booking");
        }

        BookingStatus currentStatus = booking.getStatus();

        // 🚨 Terminal states
        if (currentStatus == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (currentStatus == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed booking cannot be cancelled");
        }

        if (req.cancellationReason() == null || req.cancellationReason().isBlank()) {
            throw new BadRequestException("Cancellation reason is required");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setStatusUpdatedAt(LocalDateTime.now());
        booking.setCancellationReason(req.cancellationReason());
        booking.setCancelledBy(CancelledBy.USER);

        // 🔄 Release slots
        Lab lab = booking.getLab();
        lab.setSlotCapacityOnline(
                lab.getSlotCapacityOnline() + booking.getBookingTests().size()
        );
        labRepo.save(lab);

        return bookingRepo.save(booking);
    }

}