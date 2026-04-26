package com.springboot.smartcampus.service.impl;

import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.repository.UserRepository;
import com.springboot.smartcampus.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;

    @Override
    public ResponseEntity<Map<String, Object>> getDashboardData(OAuth2User oauthUser) {
        if (oauthUser == null) {
            return ResponseEntity.status(401).build();
        }
        String email = oauthUser.getAttribute("email");
        return buildUserResponse(email, oauthUser.getAttributes());
    }

    @Override
    public ResponseEntity<Map<String, Object>> getUserMe(OAuth2User oauthUser, String email) {
        if (oauthUser != null) {
            String oauthEmail = oauthUser.getAttribute("email");
            return buildUserResponse(oauthEmail, oauthUser.getAttributes());
        }
        if (email != null && !email.isBlank()) {
            return buildUserResponse(email.trim().toLowerCase(), Map.of());
        }
        return ResponseEntity.status(401).build();
    }

    @Override
    public ResponseEntity<List<Map<String, Object>>> getPendingUsers() {
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

    @Override
    public ResponseEntity<Map<String, String>> approveUser(Long id) {
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

    private ResponseEntity<Map<String, Object>> buildUserResponse(String email, Map<String, Object> baseAttributes) {
        User dbUser = userRepository.findByEmail(email).orElse(null);
        Map<String, Object> response = new HashMap<>(baseAttributes);

        if (dbUser != null) {
            response.put("role",   dbUser.getRole());
            response.put("status", dbUser.getStatus() != null ? dbUser.getStatus() : "ACTIVE");
            response.put("name",   dbUser.getName());
            response.put("email",  dbUser.getEmail());
        } else {
            response.put("role",   "STUDENT");
            response.put("status", "ACTIVE");
            response.put("email",  email);
        }

        return ResponseEntity.ok(response);
    }
}
