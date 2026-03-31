package com.lablocator.service;

import com.lablocator.dto.notification.NotificationDto;
import com.lablocator.model.Notification;
import com.lablocator.repository.NotificationRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationRepo notificationRepo;

    /**
     * Persist a notification to the DB and push it in real-time via WebSocket.
     *
     * @param userId        target user's DB id (for persistence)
     * @param userEmail     target user's email — this is the STOMP principal name used for routing
     * @param type          e.g. "BOOKING_CONFIRMED"
     * @param message       human-readable message
     * @param bookingId     referenceId (for deep-linking in the frontend)
     * @param bookingStatus the new booking status string (CONFIRMED / COMPLETED / CANCELLED)
     */
    @Transactional
    public void createAndSend(Long userId, String userEmail, String type, String message, Long bookingId, String bookingStatus) {
        // 1. Persist
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .referenceId(bookingId)
                .bookingStatus(bookingStatus)
                .read(false)
                .build();

        notification = notificationRepo.save(notification);

        // 2. Push real-time — principal name is the user's email (JWT subject)
        NotificationDto dto = NotificationDto.from(notification);
        try {
            messagingTemplate.convertAndSendToUser(
                    userEmail,           // must match the STOMP session principal name
                    "/queue/notifications",
                    dto
            );
        } catch (Exception ex) {
            // WebSocket push failure must not roll back the DB transaction
            log.warn("WebSocket push failed for user={}: {}", userEmail, ex.getMessage());
        }
    }

    /**
     * Fetch all notifications for a user (newest first).
     */
    public List<NotificationDto> getNotifications(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDto::from)
                .toList();
    }

    /**
     * Returns unread notification count for a user.
     */
    public long getUnreadCount(Long userId) {
        return notificationRepo.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark all unread notifications as read for a user.
     */
    @Transactional
    public void markAllRead(Long userId) {
        notificationRepo.markAllReadByUserId(userId);
    }
}
