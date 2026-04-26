package com.springboot.smartcampus.service.impl;

import com.springboot.smartcampus.enums.ResourceStatus;
import com.springboot.smartcampus.model.Booking;
import com.springboot.smartcampus.model.Resource;
import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.repository.BookingRepository;
import com.springboot.smartcampus.repository.ResourceRepository;
import com.springboot.smartcampus.repository.UserRepository;
import com.springboot.smartcampus.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    @Override
    public ResponseEntity<?> createBooking(Map<String, Object> payload, String email) {
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");

        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            Resource resource = resolveBookableResource(payload);
            String purpose = (String) payload.get("purpose");
            Integer attendees = payload.get("attendees") != null ? Integer.parseInt(payload.get("attendees").toString()) : 0;
            LocalDateTime start = LocalDateTime.parse(payload.get("startTime").toString());
            LocalDateTime end = LocalDateTime.parse(payload.get("endTime").toString());

            if (!start.isBefore(end)) {
                throw new IllegalArgumentException("endTime must be after startTime");
            }

            List<Booking> conflicts = bookingRepository.findOverlappingBookings(resource.getName(), start, end);
            if (!conflicts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Conflict: This resource is already booked during the selected time.");
            }

            Booking booking = Booking.builder()
                    .user(user)
                    .resourceName(resource.getName())
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

    @Override
    public ResponseEntity<?> getMyBookings(String email) {
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(bookingRepository.findByUser(user));
    }

    @Override
    public ResponseEntity<?> getAllBookings(String email, String status) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access only.");
        }

        List<Booking> all = bookingRepository.findAll();
        if (status != null && !status.isBlank()) {
            all = all.stream().filter(b -> b.getStatus().equalsIgnoreCase(status)).toList();
        }
        return ResponseEntity.ok(all);
    }

    @Override
    public ResponseEntity<?> approveBooking(Long id, Map<String, String> payload, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null || !"ADMIN".equals(admin.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        return bookingRepository.findById(id).map(b -> {
            b.setStatus("APPROVED");
            if (payload != null && payload.containsKey("reason")) b.setAdminReason(payload.get("reason"));
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<?> rejectBooking(Long id, Map<String, String> payload, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null || !"ADMIN".equals(admin.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        return bookingRepository.findById(id).map(b -> {
            b.setStatus("REJECTED");
            b.setAdminReason(payload.get("reason"));
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<?> cancelBooking(Long id, String userEmail) {
        if (userEmail == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(userEmail).orElse(null);
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return bookingRepository.findById(id).map(b -> {
            boolean isAdmin = "ADMIN".equals(currentUser.getRole());
            boolean isOwner = b.getUser().getEmail().equals(userEmail);

            if (!isOwner && !isAdmin) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            
            b.setStatus("CANCELLED");
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<?> updateBooking(Long id, Map<String, Object> payload, String email) {
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");

        try {
            return bookingRepository.findById(id).map(existingBooking -> {
                if (!existingBooking.getUser().getEmail().equals(email)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You do not own this booking.");
                }

                Resource resource = resolveBookableResource(payload);
                String purpose = (String) payload.get("purpose");
                Integer attendees = payload.get("attendees") != null ? Integer.parseInt(payload.get("attendees").toString()) : existingBooking.getAttendeesCount();
                LocalDateTime start = LocalDateTime.parse(payload.get("startTime").toString());
                LocalDateTime end = LocalDateTime.parse(payload.get("endTime").toString());

                List<Booking> conflicts = bookingRepository.findOverlappingBookingsExcluding(resource.getName(), start, end, id);
                if (!conflicts.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Conflict: This resource is already booked during the selected time.");
                }

                existingBooking.setResourceName(resource.getName());
                existingBooking.setPurpose(purpose);
                existingBooking.setAttendeesCount(attendees);
                existingBooking.setStartTime(start);
                existingBooking.setEndTime(end);
                existingBooking.setStatus("PENDING");

                return ResponseEntity.ok(bookingRepository.save(existingBooking));
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Update error: ", e);
            return ResponseEntity.badRequest().body("Invalid booking data: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteBooking(Long id, String email) {
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return bookingRepository.findById(id).map(b -> {
            boolean isAdmin = "ADMIN".equals(currentUser.getRole());
            boolean isOwner = b.getUser().getEmail().equals(email);

            if (!isOwner && !isAdmin) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            
            bookingRepository.delete(b);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private Resource resolveBookableResource(Map<String, Object> payload) {
        String resourceIdValue = payload.get("resourceId") != null ? payload.get("resourceId").toString() : null;
        Resource resource;

        if (resourceIdValue != null && !resourceIdValue.isBlank()) {
            Long resourceId = Long.parseLong(resourceIdValue);
            resource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        } else {
            String resourceName = (String) payload.get("resourceName");
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
}
