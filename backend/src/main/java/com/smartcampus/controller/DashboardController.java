package com.smartcampus.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.Map;

/**
 * Controller to resolve the 404 error at /dashboard.
 * Displays user identity confirmed by Google Login.
 */
@RestController
public class DashboardController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        return ResponseEntity.ok(user.getAttributes());
    }
}
