package com.lablocator.dto.admin;

import com.lablocator.model.RequestStatus;
import com.lablocator.model.RequestType;

public record UpdateLabRequestStatusReq(
        String adminRemark,
        RequestStatus status,
        RequestType requestType
) {
}
