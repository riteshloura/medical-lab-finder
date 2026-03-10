package com.lablocator.dto.lab;


public record GetLabTestResponse(
        String name,
        String description,
        Long testId,
        Double price,
        Boolean homeCollectionAvailable
) {      }
