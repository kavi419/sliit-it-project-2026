package com.springboot.smartcampus.controller;

import com.springboot.smartcampus.enums.ResourceStatus;
import com.springboot.smartcampus.model.Booking;
import com.springboot.smartcampus.model.Resource;
import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private User user;
    private Resource activeResource;
    private Map<String, Object> payload;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("student@campus.edu");
        user.setName("Student One");
        user.setRole("USER");

        activeResource = Resource.builder()
                .id(10L)
                .name("Innovation Lab")
                .type("Lab")
                .capacity(30)
                .location("Block C")
                .status(ResourceStatus.ACTIVE)
                .build();

        payload = new HashMap<>();
        payload.put("resourceId", "10");
        payload.put("startTime", "2026-04-25T09:00:00");
        payload.put("endTime", "2026-04-25T11:00:00");

        // Setup Spring Security context so getAuthEmail() returns our test user
        Authentication auth = new UsernamePasswordAuthenticationToken("student@campus.edu", null, List.of());
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createBooking_ShouldSaveActiveResourceBooking() {
        Booking booking = Booking.builder()
                .resourceName("Innovation Lab")
                .status("PENDING")
                .build();
        doReturn(ResponseEntity.status(HttpStatus.CREATED).body(booking))
            .when(bookingService).createBooking(any(), any());

        ResponseEntity<?> response = bookingController.createBooking(payload);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        Booking saved = (Booking) response.getBody();
        assertNotNull(saved);
        assertEquals("Innovation Lab", saved.getResourceName());
        assertEquals("PENDING", saved.getStatus());
        verify(bookingService).createBooking(eq(payload), any());
    }

    @Test
    void createBooking_ShouldRejectInactiveResource() {
        doReturn(ResponseEntity.badRequest().body("Selected resource is not available for booking"))
            .when(bookingService).createBooking(any(), any());

        ResponseEntity<?> response = bookingController.createBooking(payload);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void createBooking_ShouldRejectInvalidTimeWindow() {
        doReturn(ResponseEntity.badRequest().body("endTime must be after startTime"))
            .when(bookingService).createBooking(any(), any());

        ResponseEntity<?> response = bookingController.createBooking(payload);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
