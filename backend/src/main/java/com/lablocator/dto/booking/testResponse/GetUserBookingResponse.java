package com.lablocator.dto.booking.testResponse;

import com.lablocator.dto.review.UserResponse;
import com.lablocator.model.BookingStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record GetUserBookingResponse(
        Long id,
        BookingStatus status,
        List<BookingTestResponse> bookingTests,
        LabResponse lab,
        UserResponse user,
        LocalTime timeSlot,
        LocalDateTime bookingDate,
        String cancellationReason,
        LocalDateTime statusUpdatedAt
) {
}
