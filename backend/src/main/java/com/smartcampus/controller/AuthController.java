package com.smartcampus.controller;

import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Authentication REST endpoints for email/password users.
 *
 * Endpoints:
 *  POST /api/auth/check-email  → does this email already exist?
 *  POST /api/auth/register     → create a new account (BCrypt password, role, status)
 *  POST /api/auth/login        → verify credentials, return role + status
 */
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/check-email
    // Body: { "email": "user@example.com" }
    // Returns: true if email exists, false otherwise
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            logger.warn("check-email: missing or empty email field.");
            return ResponseEntity.badRequest().body(false);
        }

        String trimmed = email.trim().toLowerCase();
        logger.info("check-email: checking {}", trimmed);

        try {
            boolean exists = userRepository.existsByEmail(trimmed);
            logger.info("check-email: {} → exists={}", trimmed, exists);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            logger.error("check-email: error for {}", trimmed, e);
            return ResponseEntity.internalServerError().body(false);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/register
    // Body: { "email": "...", "password": "...", "role": "STUDENT" | "ADMIN" }
    // Returns 201 + { role, status } on success
    //         409 if email already taken
    //         400 if validation fails
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> request) {
        String email    = request.get("email");
        String password = request.get("password");
        String role     = request.get("role");

        // ── Validation ──────────────────────────────────────────────────────
        if (email == null || email.trim().isEmpty()) {
            return error(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        if (password == null || password.length() < 6) {
            return error(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
        }
        if (!"STUDENT".equals(role) && !"ADMIN".equals(role)) {
            return error(HttpStatus.BAD_REQUEST, "Role must be STUDENT or ADMIN.");
        }

        String trimmedEmail = email.trim().toLowerCase();

        // ── Duplicate check ─────────────────────────────────────────────────
        if (userRepository.existsByEmail(trimmedEmail)) {
            logger.warn("register: email already taken → {}", trimmedEmail);
            return error(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        // ── Determine status ────────────────────────────────────────────────
        // Admin self-registrations are placed in PENDING_ADMIN and must be
        // approved by a super-admin before they can access restricted areas.
        String status = "ADMIN".equals(role) ? "PENDING_ADMIN" : "ACTIVE";

        // ── Build & save user ───────────────────────────────────────────────
        UserEntity newUser = UserEntity.builder()
                .email(trimmedEmail)
                .name(trimmedEmail)                          // placeholder; update later
                .password(passwordEncoder.encode(password)) // BCrypt hash
                .role(role)
                .status(status)
                .build();

        try {
            userRepository.save(newUser);
            logger.info("register: created user {} as {} with status {}", trimmedEmail, role, status);
        } catch (Exception e) {
            logger.error("register: DB error for {}", trimmedEmail, e);
            return error(HttpStatus.INTERNAL_SERVER_ERROR, "Registration failed. Please try again.");
        }

        Map<String, String> body = new HashMap<>();
        body.put("role",   role);
        body.put("status", status);
        body.put("email",  trimmedEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // Body: { "email": "...", "password": "..." }
    // Returns 200 + { role, status, email } on success
    //         401 if credentials are wrong
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        String email    = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return error(HttpStatus.BAD_REQUEST, "Email and password are required.");
        }

        String trimmedEmail = email.trim().toLowerCase();

        Optional<UserEntity> userOpt = userRepository.findByEmail(trimmedEmail);

        // ── User not found ───────────────────────────────────────────────────
        if (userOpt.isEmpty()) {
            logger.warn("login: no account for {}", trimmedEmail);
            return error(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        UserEntity user = userOpt.get();

        // ── Google-only account (no password set) ────────────────────────────
        if (user.getPassword() == null) {
            logger.warn("login: {} is a Google-only account", trimmedEmail);
            return error(HttpStatus.UNAUTHORIZED, "This account uses Google sign-in. Please use 'Continue with Google'.");
        }

        // ── Password verification ────────────────────────────────────────────
        if (!passwordEncoder.matches(password, user.getPassword())) {
            logger.warn("login: wrong password for {}", trimmedEmail);
            return error(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        logger.info("login: successful for {} (role={}, status={})", trimmedEmail, user.getRole(), user.getStatus());

        Map<String, String> body = new HashMap<>();
        body.put("role",   user.getRole());
        body.put("status", user.getStatus());
        body.put("email",  user.getEmail());
        return ResponseEntity.ok(body);
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }
}
