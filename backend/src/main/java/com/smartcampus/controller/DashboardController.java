package com.smartcampus.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller to resolve the 404 error at /dashboard.
 * Displays user identity confirmed by Google Login.
 */
@RestController
public class DashboardController {

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return "No authenticated user found.";
        }
        
        String name = user.getAttribute("name");
        String email = user.getAttribute("email");
        
        return "<h1>Welcome to Smart Campus Hub</h1>" +
               "<p><b>Name:</b> " + name + "</p>" +
               "<p><b>Email:</b> " + email + "</p>" +
               "<p>Your identity has been confirmed via Google OAuth2.</p>" +
               "<hr>" +
               "<p>Check your terminal for <b>'User saved successfully'</b> log.</p>";
    }
}
