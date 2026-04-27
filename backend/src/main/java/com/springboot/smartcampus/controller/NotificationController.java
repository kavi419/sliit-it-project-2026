package com.springboot.smartcampus.controller;

import com.springboot.smartcampus.dto.NotificationDTO;
import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.repository.UserRepository;
import com.springboot.smartcampus.service.impl.NotificationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationServiceImpl notificationService;
    private final UserRepository userRepository;

    // Helper method to get the current logged-in user's ID using both OAuth and Username/Password methods
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }

        String email;
        if (auth.getPrincipal() instanceof OAuth2User oauth2User) {
            email = oauth2User.getAttribute("email");
        } else {
            email = auth.getName();
        }

        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications() {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount() {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok().build();
    }

    // ── TEMPORARY ENDPOINT FOR TESTING ──
    @PostMapping("/test")
    public ResponseEntity<String> createTestNotification(@RequestParam String msg, @RequestParam String type) {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        
        com.springboot.smartcampus.enums.NotificationType notifType;
        try {
            notifType = com.springboot.smartcampus.enums.NotificationType.valueOf(type.toUpperCase());
        } catch (Exception e) {
            notifType = com.springboot.smartcampus.enums.NotificationType.SYSTEM_ALERT;
        }

        notificationService.createNotification(userId, msg, notifType, 999L);
        return ResponseEntity.ok("Test notification created successfully!");
    }
}
