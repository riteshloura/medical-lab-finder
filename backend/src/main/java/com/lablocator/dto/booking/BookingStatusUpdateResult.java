package com.lablocator.dto.booking;

import com.lablocator.model.Booking;

/**
 * Wraps booking status update result with email delivery outcome.
 */
public record BookingStatusUpdateResult(Booking booking, boolean emailSent) {
}
