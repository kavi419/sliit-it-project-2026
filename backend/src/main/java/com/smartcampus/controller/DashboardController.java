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
    // Returns the logged-in Google OAuth2 user's profile + DB role/status.
    // Called by the Vite proxy: frontend /api/dashboard → backend /api/dashboard
    @GetMapping("/api/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@AuthenticationPrincipal OAuth2User oauthUser) {
        if (oauthUser == null) {
            return ResponseEntity.status(401).build();
        }

        String email = oauthUser.getAttribute("email");
        return buildUserResponse(email, oauthUser.getAttributes());
    }

    // ── GET /api/user/me ───────────────────────────────────────────────────────
    // Unified "who am I?" endpoint.
    //  - OAuth2 session present  → reads DB role/status for the Google user
    //  - ?email=... param given  → looks up that email in the DB directly
    //    (used by AuthContext after email/password login where there is no
    //     server-side Spring Security session)
    // Returns 200 with user payload, or 404 when not found.
    @GetMapping("/api/user/me")
    public ResponseEntity<Map<String, Object>> userMe(
            @AuthenticationPrincipal OAuth2User oauthUser,
            @RequestParam(required = false) String email,
            jakarta.servlet.http.HttpServletRequest request) {

        // Priority 1: Explicit mock headers from frontend
        String mockEmail = request.getHeader("X-Mock-Email");
        if (mockEmail != null && !mockEmail.isBlank()) {
            return buildUserResponse(mockEmail.trim().toLowerCase(), Map.of());
        }

        // Priority 2: explicit email param (used by frontend mock login to bypass stale sessions)
        if (email != null && !email.isBlank()) {
            return buildUserResponse(email.trim().toLowerCase(), Map.of());
        }

        // Priority 3: OAuth2 session in Spring Security context
        if (oauthUser != null) {
            String oauthEmail = oauthUser.getAttribute("email");
            return buildUserResponse(oauthEmail, oauthUser.getAttributes());
        }

        return ResponseEntity.status(401).build();
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

    // ── Private helper ─────────────────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> buildUserResponse(
            String email, Map<String, Object> baseAttributes) {

        UserEntity dbUser = userRepository.findByEmail(email).orElse(null);
        Map<String, Object> response = new HashMap<>(baseAttributes);

        if (dbUser != null) {
            // Always prefer DB values — they are the source of truth for role/status
            response.put("role",   dbUser.getRole());
            response.put("status", dbUser.getStatus() != null ? dbUser.getStatus() : "ACTIVE");
            response.put("name",   dbUser.getName());
            response.put("email",  dbUser.getEmail());
            response.put("id",     dbUser.getId());
        } else {
            response.put("role",   "STUDENT");
            response.put("status", "ACTIVE");
            response.put("email",  email);
        }

        return ResponseEntity.ok(response);
    }
}
