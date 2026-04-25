package com.smartcampus.controller;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.model.BookingEntity;
import com.smartcampus.model.ResourceEntity;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

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

        ResourceEntity resource = resolveBookableResource(payload);
        LocalDateTime startTime = parseDateTime(payload.get("startTime"), "startTime");
        LocalDateTime endTime = parseDateTime(payload.get("endTime"), "endTime");
        validateTimeWindow(startTime, endTime);

        BookingEntity booking = BookingEntity.builder()
                .user(user)
                .resourceName(resource.getName())
                .startTime(startTime)
                .endTime(endTime)
                .status("PENDING")
                .build();

        BookingEntity saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    private ResourceEntity resolveBookableResource(Map<String, String> payload) {
        String resourceIdValue = payload.get("resourceId");
        ResourceEntity resource;

        if (resourceIdValue != null && !resourceIdValue.isBlank()) {
            Long resourceId = Long.parseLong(resourceIdValue);
            resource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        } else {
            String resourceName = payload.get("resourceName");
            if (resourceName == null || resourceName.isBlank()) {
                throw new IllegalArgumentException("Resource must be selected");
            }
            resource = resourceRepository.findByNameIgnoreCase(resourceName.trim())
                    .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        }

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException("Selected resource is not available for booking");
        }

        return resource;
    }

    private LocalDateTime parseDateTime(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return LocalDateTime.parse(value);
    }

    private void validateTimeWindow(LocalDateTime startTime, LocalDateTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }
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
