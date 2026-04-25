package com.smartcampus.controller;

import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
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
    private final SecurityContextRepository securityContextRepository;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, SecurityContextRepository securityContextRepository) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityContextRepository = securityContextRepository;
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

        logger.info("register: received → email={}, role={}, passwordLength={}",
                email, role, password != null ? password.length() : "null");

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
        String status = "ADMIN".equals(role) ? "PENDING_ADMIN" : "ACTIVE";

        // ── Hash password ────────────────────────────────────────────────────
        String hashedPassword;
        try {
            hashedPassword = passwordEncoder.encode(password);
            logger.info("register: password hashed successfully for {}", trimmedEmail);
        } catch (Exception e) {
            logger.error("register: BCrypt encoding failed for {}: {}", trimmedEmail, e.getMessage(), e);
            return error(HttpStatus.INTERNAL_SERVER_ERROR, "Password processing failed. Please try again.");
        }

        // ── Build user ───────────────────────────────────────────────────────
        UserEntity newUser = UserEntity.builder()
                .email(trimmedEmail)
                .name(trimmedEmail)       // placeholder name; update later via profile
                .password(hashedPassword)
                .role(role)
                .status(status)
                .build();

        logger.info("register: entity built → email={}, role={}, status={}, passwordIsNull={}",
                newUser.getEmail(), newUser.getRole(), newUser.getStatus(), newUser.getPassword() == null);

        // ── Save ─────────────────────────────────────────────────────────────
        try {
            userRepository.save(newUser);
            logger.info("register: SUCCESS — created user {} as {} with status {}", trimmedEmail, role, status);
        } catch (Exception e) {
            // Log the full cause chain to make SQL errors visible in the terminal
            Throwable cause = e;
            while (cause != null) {
                logger.error("register: DB error [{}] → {}", cause.getClass().getSimpleName(), cause.getMessage());
                cause = cause.getCause();
            }
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
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> requestData,
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response) {
        String email    = requestData.get("email");
        String password = requestData.get("password");

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

        // ── Manually set authentication in SecurityContext for session persistence ──
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = 
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                trimmedEmail, null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole())));
        
        org.springframework.security.core.context.SecurityContext context = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        org.springframework.security.core.context.SecurityContextHolder.setContext(context);
        
        // Save to session so Spring Security can find it in subsequent requests
        securityContextRepository.saveContext(context, request, response);
        logger.info("login: context saved to session. JSESSIONID={}", request.getSession().getId());

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
