package com.lablocator.dto.admin;

import com.lablocator.model.RequestStatus;
import com.lablocator.model.RequestType;

import java.time.LocalDateTime;

public record LabRequestResponse(
        Long id,
        RequestType requestType,
        RequestStatus requestStatus,
        Long labId,
        String changePayload,
        String adminRemark,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt,
        RequestedByDto requestedBy
) {
    public record RequestedByDto(Long id, String name, String email) {}
}
