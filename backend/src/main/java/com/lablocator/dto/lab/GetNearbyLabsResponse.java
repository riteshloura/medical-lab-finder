package com.lablocator.dto.lab;

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
        Integer slotCapacityOnline
) {
}
