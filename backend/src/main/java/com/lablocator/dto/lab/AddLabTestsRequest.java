package com.lablocator.dto.lab;

import jakarta.validation.constraints.*;

public record AddLabTestsRequest(

        @NotNull(message = "Test id is required")
        Long testId,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false)
        Double price,

        @NotNull
        Boolean homeCollectionAvailable
) {}