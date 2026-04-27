package com.springboot.smartcampus.controller;

import com.springboot.smartcampus.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/api/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@AuthenticationPrincipal OAuth2User oauthUser) {
        return dashboardService.getDashboardData(oauthUser);
    }

    @GetMapping("/api/user/me")
    public ResponseEntity<Map<String, Object>> userMe(
            @AuthenticationPrincipal OAuth2User oauthUser,
            @RequestParam(required = false) String email) {
        return dashboardService.getUserMe(oauthUser, email);
    }

    @GetMapping("/api/admin/pending-users")
    public ResponseEntity<List<Map<String, Object>>> pendingUsers() {
        return dashboardService.getPendingUsers();
    }

    @PostMapping("/api/admin/approve/{id}")
    public ResponseEntity<Map<String, String>> approveUser(@PathVariable Long id) {
        return dashboardService.approveUser(id);
    }

    @PostMapping("/api/admin/reject/{id}")
    public ResponseEntity<Map<String, String>> rejectUser(@PathVariable Long id) {
        return dashboardService.rejectUser(id);
    }
}
