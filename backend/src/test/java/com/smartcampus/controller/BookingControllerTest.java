package com.smartcampus.controller;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.model.BookingEntity;
import com.smartcampus.model.ResourceEntity;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private BookingController bookingController;

    private UserEntity user;
    private ResourceEntity activeResource;
    private Map<String, Object> payload;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setEmail("student@campus.edu");
        user.setName("Student One");
        user.setRole("USER");

        activeResource = ResourceEntity.builder()
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
        when(userRepository.findByEmail("student@campus.edu")).thenReturn(Optional.of(user));
        when(resourceRepository.findById(10L)).thenReturn(Optional.of(activeResource));
        when(bookingRepository.findOverlappingBookings(any(), any(), any())).thenReturn(List.of());
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = bookingController.createBooking(payload);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        BookingEntity saved = (BookingEntity) response.getBody();
        assertNotNull(saved);
        assertEquals("Innovation Lab", saved.getResourceName());
        assertEquals("PENDING", saved.getStatus());
        verify(bookingRepository).save(any(BookingEntity.class));
    }

    @Test
    void createBooking_ShouldRejectInactiveResource() {
        ResourceEntity maintenanceResource = ResourceEntity.builder()
                .id(11L)
                .name("Library Room")
                .type("Room")
                .capacity(20)
                .location("Library")
                .status(ResourceStatus.MAINTENANCE)
                .build();

        payload.put("resourceId", "11");

        when(userRepository.findByEmail("student@campus.edu")).thenReturn(Optional.of(user));
        when(resourceRepository.findById(11L)).thenReturn(Optional.of(maintenanceResource));

        ResponseEntity<?> response = bookingController.createBooking(payload);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_ShouldRejectInvalidTimeWindow() {
        payload.put("endTime", "2026-04-25T08:00:00");

        when(userRepository.findByEmail("student@campus.edu")).thenReturn(Optional.of(user));
        when(resourceRepository.findById(10L)).thenReturn(Optional.of(activeResource));

        ResponseEntity<?> response = bookingController.createBooking(payload);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(bookingRepository, never()).save(any());
    }
}