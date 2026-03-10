package com.lablocator.dto.lab;

import jakarta.validation.constraints.*;

public record CreateLabRequest(

        @NotBlank(message = "Lab name is required")
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        String name,

        @NotBlank(message = "Description is required")
        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description,

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
        @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
        Double longitude,

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
        @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
        Double latitude,

        @NotBlank(message = "Contact number is required")
        String contactNumber,

        @NotNull(message = "Slot capacity is required")
        @Min(value = 1, message = "Slot capacity must be at least 1")
        @Max(value = 1000, message = "Slot capacity cannot exceed 1000")
        Integer slotCapacityOnline,

        @NotBlank(message = "Address is required")
        @Size(max = 255)
        String address,

        @NotBlank(message = "City is required")
        @Size(max = 100)
        String city,

        @NotBlank(message = "State is required")
        @Size(max = 100)
        String state
) {}