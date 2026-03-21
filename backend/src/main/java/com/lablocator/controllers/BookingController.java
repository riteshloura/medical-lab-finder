package com.lablocator.controllers;

import com.lablocator.dto.booking.CreateBookingRequest;
import com.lablocator.dto.booking.testResponse.GetUserBookingResponse;
import com.lablocator.dto.booking.UpdateBookingStatusRequest;
import com.lablocator.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/booking/me")
    public ResponseEntity<List<GetUserBookingResponse>> getUserBooking(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getUserBooking(authentication.getName()));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @GetMapping("/booking")
    public ResponseEntity<?> getLabBooking(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getLabBooking(authentication.getName()));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @GetMapping("/booking/{labId}")
    public ResponseEntity<?> getLabBookingByLabId(@PathVariable Long labId, Authentication authentication) {
        return ResponseEntity.ok(bookingService.getLabBookingByLabId(labId, authentication.getName()));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PutMapping("/booking/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long bookingId,
                                                 @Valid @RequestBody UpdateBookingStatusRequest req,
                                                 Authentication authentication) {
        return ResponseEntity.ok(
                bookingService.updateBookingStatus(bookingId, authentication.getName(), req)
        );
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/labs/{labId}/booking")
    public ResponseEntity<?> createBooking(@PathVariable Long labId,
                                           Authentication authentication,
                                           @RequestBody CreateBookingRequest req) {
        return ResponseEntity.ok(bookingService.createBooking(labId, authentication.getName(), req));
    }
}
