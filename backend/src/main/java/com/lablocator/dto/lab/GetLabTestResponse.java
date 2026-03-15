package com.lablocator.dto.lab;


public record GetLabTestResponse(
        String name,
        String description,
        Long id,
        Double price,
        Boolean homeCollectionAvailable
) {      }
