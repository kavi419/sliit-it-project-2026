package com.smartcampus.controller;

import com.smartcampus.model.BookingEntity;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for resource booking operations implementing Module B requirements.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class BookingController {
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Helper to get authenticated user email.
     */
    private String getAuthEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("getAuthEmail: auth={}, isAuthenticated={}", 
            auth != null ? auth.getClass().getSimpleName() : "null",
            auth != null && auth.isAuthenticated());

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            logger.warn("getAuthEmail: No valid authentication found in SecurityContext.");
            return null;
        }

        if (auth.getPrincipal() instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            logger.info("getAuthEmail: OAuth2User detected. Email={}", email);
            return email;
        }

        String name = auth.getName();
        logger.info("getAuthEmail: Standard Auth detected. Name/Principal={}", name);
        return name;
    }

    /**
     * Create a new booking request.
     * Prevents overlapping approved bookings.
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> payload) {
        String email = getAuthEmail();
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");

        try {
            UserEntity user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            String resourceName = (String) payload.get("resourceName");
            String purpose = (String) payload.get("purpose");
            Integer attendees = payload.get("attendees") != null ? Integer.parseInt(payload.get("attendees").toString()) : 0;
            LocalDateTime start = LocalDateTime.parse(payload.get("startTime").toString());
            LocalDateTime end = LocalDateTime.parse(payload.get("endTime").toString());

            // ── Conflict Detection ──
            List<BookingEntity> conflicts = bookingRepository.findOverlappingBookings(resourceName, start, end);
            if (!conflicts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Conflict: This resource is already booked during the selected time.");
            }

            BookingEntity booking = BookingEntity.builder()
                    .user(user)
                    .resourceName(resourceName)
                    .purpose(purpose)
                    .attendeesCount(attendees)
                    .startTime(start)
                    .endTime(end)
                    .status("PENDING")
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(bookingRepository.save(booking));
        } catch (Exception e) {
            logger.error("Booking error: ", e);
            return ResponseEntity.badRequest().body("Invalid booking data: " + e.getMessage());
        }
    }

    /**
     * Users view their own bookings.
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings() {
        String email = getAuthEmail();
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(bookingRepository.findByUser(user));
    }

    /**
     * Admin: View all bookings (optionally filter by status).
     */
    @GetMapping
    public ResponseEntity<?> getAllBookings(@RequestParam(required = false) String status) {
        String email = getAuthEmail();
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access only.");
        }

        List<BookingEntity> all = bookingRepository.findAll();
        if (status != null && !status.isBlank()) {
            all = all.stream().filter(b -> b.getStatus().equalsIgnoreCase(status)).toList();
        }
        return ResponseEntity.ok(all);
    }

    /**
     * Admin: Approve a booking.
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        String email = getAuthEmail();
        UserEntity admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || !"ADMIN".equals(admin.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        return bookingRepository.findById(id).map(b -> {
            b.setStatus("APPROVED");
            if (payload != null && payload.containsKey("reason")) b.setAdminReason(payload.get("reason"));
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin: Reject a booking.
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String email = getAuthEmail();
        UserEntity admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || !"ADMIN".equals(admin.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        return bookingRepository.findById(id).map(b -> {
            b.setStatus("REJECTED");
            b.setAdminReason(payload.get("reason"));
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cancel a booking. Users can cancel their own, Admins can cancel any.
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        String email = getAuthEmail();
        logger.info("cancelBooking: Request for id={} by user={}", id, email);
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        UserEntity currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser == null) {
            logger.warn("cancelBooking: Current user not found in DB: {}", email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return bookingRepository.findById(id).map(b -> {
            boolean isAdmin = "ADMIN".equals(currentUser.getRole());
            boolean isOwner = b.getUser().getEmail().equals(email);

            logger.info("cancelBooking: Booking found. Owner={}, IsAdmin={}, CurrentRole={}", 
                b.getUser().getEmail(), isAdmin, currentUser.getRole());

            if (!isOwner && !isAdmin) {
                logger.warn("cancelBooking: Permission denied. User {} is not owner or admin.", email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            b.setStatus("CANCELLED");
            BookingEntity saved = bookingRepository.save(b);
            logger.info("cancelBooking: SUCCESS for id={}. New status={}", id, saved.getStatus());
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> {
            logger.warn("cancelBooking: Booking not found for id={}", id);
            return ResponseEntity.notFound().build();
        });
    }

    /**
     * Update an existing booking.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String email = getAuthEmail();
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");

        try {
            return bookingRepository.findById(id).map(existingBooking -> {
                // Security: Must be the owner
                if (!existingBooking.getUser().getEmail().equals(email)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You do not own this booking.");
                }

                // Business Rule: Can only edit PENDING or REJECTED (?)
                // Let's say we allow editing but it resets status to PENDING
                
                String resourceName = (String) payload.get("resourceName");
                String purpose = (String) payload.get("purpose");
                Integer attendees = payload.get("attendees") != null ? Integer.parseInt(payload.get("attendees").toString()) : existingBooking.getAttendeesCount();
                LocalDateTime start = LocalDateTime.parse(payload.get("startTime").toString());
                LocalDateTime end = LocalDateTime.parse(payload.get("endTime").toString());

                // Conflict Detection (excluding current booking)
                List<BookingEntity> conflicts = bookingRepository.findOverlappingBookingsExcluding(resourceName, start, end, id);
                if (!conflicts.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Conflict: This resource is already booked during the selected time.");
                }

                existingBooking.setResourceName(resourceName);
                existingBooking.setPurpose(purpose);
                existingBooking.setAttendeesCount(attendees);
                existingBooking.setStartTime(start);
                existingBooking.setEndTime(end);
                existingBooking.setStatus("PENDING"); // Reset to pending after edit

                return ResponseEntity.ok(bookingRepository.save(existingBooking));
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Update error: ", e);
            return ResponseEntity.badRequest().body("Invalid booking data: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        String email = getAuthEmail();
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        UserEntity currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return bookingRepository.findById(id).map(b -> {
            boolean isAdmin = "ADMIN".equals(currentUser.getRole());
            boolean isOwner = b.getUser().getEmail().equals(email);

            if (!isOwner && !isAdmin) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            
            bookingRepository.delete(b);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
