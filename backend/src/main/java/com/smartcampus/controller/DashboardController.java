package com.smartcampus.controller;

import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

/**
 * Controller to resolve the 404 error at /dashboard.
 * Displays user identity confirmed by Google Login.
 */
@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        String email = user.getAttribute("email");
        UserEntity dbUser = userRepository.findByEmail(email).orElse(null);

        Map<String, Object> response = new HashMap<>(user.getAttributes());
        if (dbUser != null) {
            response.put("role", dbUser.getRole());
            response.put("name", dbUser.getName()); // Override name just in case
        } else {
            response.put("role", "STUDENT");
        }
        
        return ResponseEntity.ok(response);
    }
}
