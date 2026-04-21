package com.smartcampus.controller;

import com.smartcampus.model.BookingEntity;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller for resource booking operations.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Create a new booking for the authenticated user.
     */
    @PostMapping
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody Map<String, String> payload) {
        
        try {
            logger.info("createBooking: START - Resource: {}, Start: {}, End: {}", 
                payload.get("resourceName"), payload.get("startTime"), payload.get("endTime"));

            String email;
            if (oauth2User != null) {
                email = oauth2User.getAttribute("email");
                logger.info("createBooking: Using OAuth2 email: {}", email);
            } else {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                    logger.warn("createBooking: User not authenticated (No SecurityContext). Using fallback user.");
                    // FALLBACK: Use the first user in the DB if not authenticated (for testing)
                    UserEntity fallbackUser = userRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("No users in database at all!"));
                    email = fallbackUser.getEmail();
                } else {
                    email = auth.getName();
                }
                logger.info("createBooking: Using email: {}", email);
            }

            UserEntity user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found in database: " + email));
            logger.info("createBooking: Found user ID: {}", user.getId());

            String resourceName = payload.get("resourceName");
            LocalDateTime startTime = LocalDateTime.parse(payload.get("startTime"));
            LocalDateTime endTime = LocalDateTime.parse(payload.get("endTime"));
            logger.info("createBooking: Parsed times successfully");

            BookingEntity booking = BookingEntity.builder()
                    .user(user)
                    .resourceName(resourceName)
                    .startTime(startTime)
                    .endTime(endTime)
                    .status("PENDING")
                    .build();

            logger.info("createBooking: Saving to database...");
            BookingEntity saved = bookingRepository.save(booking);
            logger.info("createBooking: SUCCESS - Booking ID: {}", saved.getId());
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("createBooking: FAILED with exception: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error creating booking: " + e.getMessage());
        }
    }

    /**
     * Get all bookings for the authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingEntity>> getMyBookings(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        String email;
        if (oauth2User != null) {
            email = oauth2User.getAttribute("email");
        } else {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                logger.warn("getMyBookings: User not authenticated. Using fallback user.");
                UserEntity fallbackUser = userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No users found"));
                email = fallbackUser.getEmail();
            } else {
                email = auth.getName();
            }
        }

        logger.info("getMyBookings: finding bookings for {}", email);
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<BookingEntity> bookings = bookingRepository.findByUser(user);
        logger.info("getMyBookings: found {} bookings", bookings.size());
        return ResponseEntity.ok(bookings);
    }

    /**
     * Update an existing booking.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody Map<String, String> payload) {
        
        try {
            BookingEntity booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

            // In a real app, verify ownership here...
            
            if (payload.containsKey("startTime")) {
                booking.setStartTime(LocalDateTime.parse(payload.get("startTime")));
            }
            if (payload.containsKey("endTime")) {
                booking.setEndTime(LocalDateTime.parse(payload.get("endTime")));
            }
            
            booking.setStatus("PENDING"); // Reset status on edit
            return ResponseEntity.ok(bookingRepository.save(booking));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Update failed: " + e.getMessage());
        }
    }

    /**
     * Delete a booking.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        try {
            if (!bookingRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            bookingRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Deletion failed: " + e.getMessage());
        }
    }
}
