package com.lablocator.dto.lab;

import java.time.LocalDateTime;

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
        LocalDateTime createdAt
) {
}
