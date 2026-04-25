package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // Helper method to get the current logged-in user's ID
    private Long getCurrentUserId(OAuth2User principal) {
        if (principal == null) return null;
        String email = principal.getAttribute("email");
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(@AuthenticationPrincipal OAuth2User principal) {
        Long userId = getCurrentUserId(principal);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@AuthenticationPrincipal OAuth2User principal) {
        Long userId = getCurrentUserId(principal);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal OAuth2User principal) {
        Long userId = getCurrentUserId(principal);
        if (userId == null) return ResponseEntity.status(401).build();
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal OAuth2User principal) {
        Long userId = getCurrentUserId(principal);
        if (userId == null) return ResponseEntity.status(401).build();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, @AuthenticationPrincipal OAuth2User principal) {
        Long userId = getCurrentUserId(principal);
        if (userId == null) return ResponseEntity.status(401).build();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok().build();
    }

    // ── TEMPORARY ENDPOINT FOR TESTING ──
    @PostMapping("/test")
    public ResponseEntity<String> createTestNotification(@AuthenticationPrincipal OAuth2User principal, @RequestParam String msg, @RequestParam String type) {
        Long userId = getCurrentUserId(principal);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        
        com.smartcampus.enums.NotificationType notifType;
        try {
            notifType = com.smartcampus.enums.NotificationType.valueOf(type.toUpperCase());
        } catch (Exception e) {
            notifType = com.smartcampus.enums.NotificationType.SYSTEM_ALERT;
        }

        notificationService.createNotification(userId, msg, notifType, 999L);
        return ResponseEntity.ok("Test notification created successfully!");
    }
}
