package com.lablocator.dto.lab;

import java.time.LocalTime;

public record GetNearbyLabsResponse(
        String name,
        String description,
        String address,
        String city,
        String state,
        String contactNumber,
        Long id,
        Double latitude,
        Double longitude,
        Integer slotCapacityOnline,
        LocalTime openingTime,
        LocalTime closingTime,
        Integer totalReviews,
        Double avgRating,
        Double distance
) {
}
