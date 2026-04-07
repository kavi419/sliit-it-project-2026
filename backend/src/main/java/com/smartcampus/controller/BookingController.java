package com.smartcampus.controller;

import com.smartcampus.model.BookingEntity;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Create a new booking for the authenticated user.
     */
    @PostMapping
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody Map<String, String> payload) {
        
        if (oauth2User == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        String email = oauth2User.getAttribute("email");
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found in database"));

        String resourceName = payload.get("resourceName");
        LocalDateTime startTime = LocalDateTime.parse(payload.get("startTime"));
        LocalDateTime endTime = LocalDateTime.parse(payload.get("endTime"));

        BookingEntity booking = BookingEntity.builder()
                .user(user)
                .resourceName(resourceName)
                .startTime(startTime)
                .endTime(endTime)
                .status("PENDING")
                .build();

        BookingEntity saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    /**
     * Get all bookings for the authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingEntity>> getMyBookings(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        if (oauth2User == null) {
            return ResponseEntity.status(401).build();
        }

        String email = oauth2User.getAttribute("email");
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(bookingRepository.findByUser(user));
    }
}
