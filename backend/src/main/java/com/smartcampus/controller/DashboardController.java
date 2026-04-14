package com.smartcampus.controller;

import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dashboard and admin management endpoints.
 */
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class DashboardController {

    private final UserRepository userRepository;

    // ── GET /api/dashboard ─────────────────────────────────────────────────────
    // Returns the currently logged-in Google OAuth2 user's profile + role/status.
    @GetMapping("/api/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        String email = user.getAttribute("email");
        UserEntity dbUser = userRepository.findByEmail(email).orElse(null);

        Map<String, Object> response = new HashMap<>(user.getAttributes());
        if (dbUser != null) {
            response.put("role",   dbUser.getRole());
            response.put("status", dbUser.getStatus());
            response.put("name",   dbUser.getName());
            response.put("email",  dbUser.getEmail());
        } else {
            response.put("role",   "STUDENT");
            response.put("status", "ACTIVE");
        }

        return ResponseEntity.ok(response);
    }

    // ── GET /api/admin/pending-users ───────────────────────────────────────────
    // Returns all users whose status is PENDING_ADMIN.
    @GetMapping("/api/admin/pending-users")
    public ResponseEntity<List<Map<String, Object>>> pendingUsers() {
        List<Map<String, Object>> pending = userRepository.findAll().stream()
                .filter(u -> "PENDING_ADMIN".equals(u.getStatus()))
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",    u.getId());
                    m.put("name",  u.getName());
                    m.put("email", u.getEmail());
                    m.put("role",  u.getRole());
                    m.put("status", u.getStatus());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(pending);
    }

    // ── POST /api/admin/approve/{id} ───────────────────────────────────────────
    // Sets the target user's status to ACTIVE and role to ADMIN.
    @PostMapping("/api/admin/approve/{id}")
    public ResponseEntity<Map<String, String>> approveUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> {
                    u.setStatus("ACTIVE");
                    u.setRole("ADMIN");
                    userRepository.save(u);

                    Map<String, String> body = new HashMap<>();
                    body.put("message", "User " + u.getEmail() + " approved as ADMIN.");
                    return ResponseEntity.ok(body);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
