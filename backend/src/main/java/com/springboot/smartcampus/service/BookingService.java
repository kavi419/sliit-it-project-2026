package com.springboot.smartcampus.service;

import com.springboot.smartcampus.model.Booking;
import com.springboot.smartcampus.model.Resource;
import com.springboot.smartcampus.model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface BookingService {
    ResponseEntity<?> createBooking(Map<String, Object> payload, String email);
    ResponseEntity<?> getMyBookings(String email);
    ResponseEntity<?> getAllBookings(String email, String status);
    ResponseEntity<?> approveBooking(Long id, Map<String, String> payload, String adminEmail);
    ResponseEntity<?> rejectBooking(Long id, Map<String, String> payload, String adminEmail);
    ResponseEntity<?> cancelBooking(Long id, String userEmail);
    ResponseEntity<?> updateBooking(Long id, Map<String, Object> payload, String email);
    ResponseEntity<?> deleteBooking(Long id, String email);
}
