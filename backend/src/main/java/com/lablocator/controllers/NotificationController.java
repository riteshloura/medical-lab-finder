package com.lablocator.controllers;

import com.lablocator.dto.notification.NotificationDto;
import com.lablocator.model.User;
import com.lablocator.repository.UserRepo;
import com.lablocator.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepo userRepo;

    /**
     * GET /api/notifications
     * Returns all notifications for the authenticated user (newest first).
     */
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(notificationService.getNotifications(user.getId()));
    }

    /**
     * GET /api/notifications/unread-count
     * Returns the unread notification count for the current user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }

    /**
     * PUT /api/notifications/read-all
     * Marks all notifications as read for the current user.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        notificationService.markAllRead(user.getId());
        return ResponseEntity.noContent().build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User getUser(UserDetails userDetails) {
        return userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
