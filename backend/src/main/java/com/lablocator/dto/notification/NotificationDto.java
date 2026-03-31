package com.lablocator.dto.notification;

import com.lablocator.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {

    private Long id;
    private String type;          // BOOKING_CONFIRMED, BOOKING_COMPLETED, BOOKING_CANCELLED
    private String message;
    private Long userId;
    private Long referenceId;     // bookingId
    private String bookingStatus; // CONFIRMED, COMPLETED, CANCELLED
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationDto from(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getMessage())
                .userId(n.getUserId())
                .referenceId(n.getReferenceId())
                .bookingStatus(n.getBookingStatus())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}