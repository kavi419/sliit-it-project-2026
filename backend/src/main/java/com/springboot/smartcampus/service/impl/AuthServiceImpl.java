package com.springboot.smartcampus.service.impl;

import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.repository.UserRepository;
import com.springboot.smartcampus.service.AuthService;
import com.springboot.smartcampus.service.NotificationService;
import com.springboot.smartcampus.enums.NotificationType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository;
    private final NotificationService notificationService;

    @Override
    public ResponseEntity<Boolean> checkEmailExists(Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(false);
        }
        String trimmed = email.trim().toLowerCase();
        try {
            boolean exists = userRepository.existsByEmail(trimmed);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            logger.error("check-email: error for {}", trimmed, e);
            return ResponseEntity.internalServerError().body(false);
        }
    }

    @Override
    public ResponseEntity<Map<String, String>> register(Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String role = request.get("role");

        // Email & Password Presence:
        if (email == null || email.trim().isEmpty()) {
            return error(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        if (password == null || password.length() < 6) {
            return error(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
        }

        // Role Validation: Check if the provided role is either STUDENT or ADMIN. If
        // not, return an error.
        if (!"STUDENT".equals(role) && !"ADMIN".equals(role)) {
            return error(HttpStatus.BAD_REQUEST, "Role must be STUDENT or ADMIN.");
        }

        String trimmedEmail = email.trim().toLowerCase();

        // Email Existence Check: Verify if the email (after trimming and converting to
        // lowercase) already exists in the database.
        if (userRepository.existsByEmail(trimmedEmail)) {
            return error(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        // Status Setting: Determine the initial status based on the role. New ADMIN
        // users are set to "PENDING_ADMIN", while STUDENTS are set to "ACTIVE".
        String status = "ADMIN".equals(role) ? "PENDING_ADMIN" : "ACTIVE";

        String hashedPassword = passwordEncoder.encode(password);

        User newUser = User.builder()
                .email(trimmedEmail)
                .name(trimmedEmail)
                .password(hashedPassword)
                .role(role)
                .status(status)
                .build();

        try {
            userRepository.save(newUser);

            // Notify Admins if registration is pending approval
            if (status.contains("PENDING")) {
                List<User> admins = userRepository.findByRole("ADMIN");
                String message = "New registration pending approval: " + trimmedEmail + " (Role: " + role + ")";
                for (User admin : admins) {
                    notificationService.createNotification(
                            admin.getId(),
                            message,
                            NotificationType.USER_REGISTRATION,
                            newUser.getId());
                }
            }
        } catch (Exception e) {
            logger.error("register: DB error", e);
            return error(HttpStatus.INTERNAL_SERVER_ERROR, "Registration failed.");
        }

        Map<String, String> body = new HashMap<>();
        body.put("role", role);
        body.put("status", status);
        body.put("email", trimmedEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @Override
    public ResponseEntity<Map<String, String>> login(Map<String, String> requestData, HttpServletRequest request,
            HttpServletResponse response) {
        String email = requestData.get("email");
        String password = requestData.get("password");

        if (email == null || password == null) {
            return error(HttpStatus.BAD_REQUEST, "Email and password are required.");
        }

        String trimmedEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(trimmedEmail);

        if (userOpt.isEmpty()) {
            return error(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        User user = userOpt.get();

        if (user.getPassword() == null) {
            return error(HttpStatus.UNAUTHORIZED,
                    "This account uses Google sign-in. Please use 'Continue with Google'.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return error(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                trimmedEmail, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())));

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        securityContextRepository.saveContext(context, request, response);

        Map<String, String> body = new HashMap<>();
        body.put("role", user.getRole());
        body.put("status", user.getStatus());
        body.put("email", user.getEmail());
        return ResponseEntity.ok(body);
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }
}
