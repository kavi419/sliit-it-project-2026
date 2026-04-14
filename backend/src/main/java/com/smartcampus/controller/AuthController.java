package com.smartcampus.controller;

import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Authentication and User specific REST endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Endpoint to check if a user's email already exists in the system.
     * 
     * @param request JSON containing the email
     * @return true if the email exists, false otherwise
     */
    @PostMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            logger.warn("Received check-email request with missing or empty email field.");
            return ResponseEntity.badRequest().body(false);
        }
        
        String trimmedEmail = email.trim().toLowerCase();
        
        try {
            logger.info("Checking existence for email: {}", trimmedEmail);
            boolean exists = userRepository.existsByEmail(trimmedEmail);
            logger.info("Email {} exists status: {}", trimmedEmail, exists);
            
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            logger.error("Error occurred while checking if email exists: {}", trimmedEmail, e);
            return ResponseEntity.internalServerError().body(false);
        }
    }
}
