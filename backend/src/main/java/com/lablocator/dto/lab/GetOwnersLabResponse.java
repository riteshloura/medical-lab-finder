package com.lablocator.dto.lab;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record GetOwnersLabResponse(
        Long id,
        String name,
        String description,
        String address,
        String city,
        String state,
        Double longitude,
        Double latitude,
        String contactNumber,
        Integer slotCapacityOnline,
        LocalDateTime createdAt,
        LocalTime openingTime,
        LocalTime closingTime
) {
}
