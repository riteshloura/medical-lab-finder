package com.lablocator.service;

import com.lablocator.dto.booking.BookingStatusUpdateResult;
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
import com.lablocator.service.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    @Autowired
    private BookingRepo bookingRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private LabRepo labRepo;
    @Autowired
    private LabTestRepo labTestRepo;
    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;


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
                    b.getCancelledBy(),
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
                    b.getCancelledBy(),
                    b.getStatusUpdatedAt()
            ));
        }

        return res;
    }

    @Transactional
    public BookingStatusUpdateResult updateBookingStatus(Long bookingId, String email, UpdateBookingStatusRequest req) {

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
        Lab lab = booking.getLab();
        if (newStatus == BookingStatus.CANCELLED) {
            if (req.cancellationReason() == null || req.cancellationReason().isBlank()) {
                throw new BadRequestException("Cancellation reason is required");
            }

            booking.setCancellationReason(req.cancellationReason());
            booking.setCancelledBy(CancelledBy.LAB_OWNER);

//            Lab lab = booking.getLab();
            lab.setSlotCapacityOnline(
                    lab.getSlotCapacityOnline() + booking.getBookingTests().size()
            );
            labRepo.save(lab);
        }

        // ✅ Update status
        booking.setStatus(newStatus);
        booking.setStatusUpdatedAt(LocalDateTime.now());

        bookingRepo.save(booking);

        String htmlContent = """
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            
            <h2 style="color: #2c3e50;">🧪 LabLocator</h2>
            <h3 style="color: #34495e;">Booking Status Update</h3>
    
            <p>Dear %s,</p>
    
            <p>
                Your booking with <strong>%s</strong> has been 
                <strong style="color: %s;">%s</strong>.
            </p>
    
            <table style="border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Booking ID:</td>
                    <td style="padding: 8px;">%d</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Lab Name:</td>
                    <td style="padding: 8px;">%s</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Address:</td>
                    <td style="padding: 8px;">%s</td>
                </tr>
            </table>
        """;

        if (newStatus == BookingStatus.CANCELLED) {
            htmlContent += """
        <p style="margin-top: 15px;">
            <strong>Cancellation Reason:</strong> %s
        </p>
    """.formatted(booking.getCancellationReason());
        }

        htmlContent += """
        <p style="margin-top: 20px;">
            For any queries, please contact the lab directly.
        </p>

        <p>
            Regards,<br/>
            <strong>%s</strong><br/>
            <span style="font-size: 12px; color: gray;">Powered by LabLocator</span>
        </p>

        <hr/>
        <p style="font-size: 12px; color: gray;">
            This is an automated notification regarding your booking.
        </p>
        </div>
        """;

        String statusColor = switch (newStatus) {
            case CONFIRMED -> "green";
            case CANCELLED -> "red";
            case COMPLETED -> "blue";
            default -> "black";
        };

        htmlContent = htmlContent.formatted(
                booking.getUser().getName(),
                lab.getName(),
                statusColor,
                newStatus,
                booking.getId(),
                lab.getName(),
                lab.getAddress(),
                lab.getName()
        );

        boolean emailSent = true;

        try {
            emailService.sendHtmlMail(
                booking.getUser().getEmail(),
                "Booking Update from " + lab.getName() + " | LabLocator",
                htmlContent,
                lab.getName()
            );
        } catch (Exception ex) {
            // Do not block booking status update if email fails
            emailSent = false;
            log.warn("Email send failed for booking {} to {}: {}", booking.getId(), booking.getUser().getEmail(), ex.getMessage());
        }

        // 🔔 Real-time notification
        String notifType = "BOOKING_" + newStatus.name();
        String notifMsg = switch (newStatus) {
            case CONFIRMED -> "Your booking #" + booking.getId() + " at " + lab.getName() + " has been confirmed.";
            case COMPLETED -> "Your booking #" + booking.getId() + " at " + lab.getName() + " is now complete. Reports will be uploaded soon.";
            case CANCELLED -> "Your booking #" + booking.getId() + " at " + lab.getName() + " was cancelled by the lab.";
            default -> "Your booking #" + booking.getId() + " status was updated to " + newStatus + ".";
        };
        notificationService.createAndSend(
                booking.getUser().getId(),
                booking.getUser().getEmail(),   // STOMP principal name = email
                notifType,
                notifMsg,
                booking.getId(),
                newStatus.name()
        );

        return new BookingStatusUpdateResult(booking, emailSent);
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

        Object saved = bookingRepo.save(booking);

        // 🔔 Notify user of their own cancellation confirmation
        notificationService.createAndSend(
                user.getId(),
                user.getEmail(),                // STOMP principal name = email
                "BOOKING_CANCELLED",
                "Your booking #" + booking.getId() + " at " + lab.getName() + " has been cancelled.",
                booking.getId(),
                "CANCELLED"
        );

        return saved;
    }

}