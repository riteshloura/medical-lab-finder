package com.lablocator.controllers;

import com.lablocator.dto.booking.CreateBookingRequest;
import com.lablocator.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/booking/me")
    public ResponseEntity<?> getUserBooking(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getUserBooking(authentication.getName()));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @GetMapping("/booking")
    public ResponseEntity<?> getLabBooking(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getLabBooking(authentication.getName()));
    }

    @PostMapping("/labs/{labId}/booking")
    public ResponseEntity<?> createBooking(@PathVariable Long labId,
                                           Authentication authentication,
                                           @RequestBody CreateBookingRequest req) {
        return ResponseEntity.ok(bookingService.createBooking(labId, authentication.getName(), req));
    }
}
