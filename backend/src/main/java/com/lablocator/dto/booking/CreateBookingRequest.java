package com.lablocator.dto.booking;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public record CreateBookingRequest(
        List<Long> testIds,
        LocalTime timeSlot
) {

}
