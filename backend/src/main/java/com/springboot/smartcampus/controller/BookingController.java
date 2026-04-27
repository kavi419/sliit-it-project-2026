package com.springboot.smartcampus.controller;

import com.springboot.smartcampus.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    private String getAuthEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        if (auth.getPrincipal() instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("email");
        }
        return auth.getName();
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> payload) {
        return bookingService.createBooking(payload, getAuthEmail());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings() {
        return bookingService.getMyBookings(getAuthEmail());
    }

    @GetMapping
    public ResponseEntity<?> getAllBookings(@RequestParam(required = false) String status) {
        return bookingService.getAllBookings(getAuthEmail(), status);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        return bookingService.approveBooking(id, payload, getAuthEmail());
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return bookingService.rejectBooking(id, payload, getAuthEmail());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id, getAuthEmail());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return bookingService.updateBooking(id, payload, getAuthEmail());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        return bookingService.deleteBooking(id, getAuthEmail());
    }
}
