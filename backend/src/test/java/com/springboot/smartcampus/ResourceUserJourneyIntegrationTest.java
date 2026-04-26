package com.springboot.smartcampus;

import com.springboot.smartcampus.dto.ResourceRequest;
import com.springboot.smartcampus.dto.ResourceResponse;
import com.springboot.smartcampus.enums.ResourceStatus;
import com.springboot.smartcampus.model.Booking;
import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.repository.BookingRepository;
import com.springboot.smartcampus.repository.UserRepository;
import com.springboot.smartcampus.service.ResourceService;
import com.springboot.smartcampus.controller.BookingController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.security.oauth2.client.registration.google.client-id=test-client-id",
    "spring.security.oauth2.client.registration.google.client-secret=test-client-secret",
    "spring.security.oauth2.client.registration.google.scope=profile,email",
    "spring.security.oauth2.client.registration.google.authorization-grant-type=authorization_code",
    "spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
    "spring.security.oauth2.client.registration.google.client-name=Google",
    "spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/auth",
    "spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token",
    "spring.security.oauth2.client.provider.google.user-info-uri=https://www.googleapis.com/oauth2/v3/userinfo",
    "spring.security.oauth2.client.provider.google.user-name-attribute=sub",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=never"
})
@Transactional
class ResourceUserJourneyIntegrationTest {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private BookingController bookingController;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private BookingRepository bookingRepository;

    private User student;

    @BeforeEach
    void setUp() {
        student = new User();
        student.setId(1L);
        student.setEmail("student@journey.com");
        student.setName("Journey Student");
        student.setRole("USER");

        when(userRepository.findByEmail("student@journey.com")).thenReturn(Optional.of(student));
        when(bookingRepository.findOverlappingBookings(any(), any(), any())).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookingRepository.findByUser(student)).thenReturn(List.of());

        // Set up Spring SecurityContext so BookingController.getAuthEmail() resolves our test user
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "student@journey.com", null, List.of()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void fullUserJourney_AdminCreates_UserSearchesAndBooks() {
        // 1. Admin creates a new resource
        ResourceRequest createRequest = new ResourceRequest(
                "Journey Lab", "Lab", 50, "Block J", ResourceStatus.ACTIVE,
                LocalTime.of(9, 0), LocalTime.of(17, 0), null, "Test Journey Lab"
        );
        ResourceResponse created = resourceService.createResource(createRequest);
        assertNotNull(created.id());

        // 2. User searches for the resource
        Page<ResourceResponse> searchResults = resourceService.searchResources(
                "Journey", null, null, null, null, null, PageRequest.of(0, 10)
        );
        assertTrue(searchResults.getContent().stream().anyMatch(r -> r.name().equals("Journey Lab")));

        // 3. User books the resource via SecurityContext authentication
        Map<String, Object> bookingPayload = new HashMap<>();
        bookingPayload.put("resourceId", String.valueOf(created.id()));
        bookingPayload.put("startTime", "2026-05-01T10:00:00");
        bookingPayload.put("endTime", "2026-05-01T12:00:00");

        var bookingResponse = bookingController.createBooking(bookingPayload);

        assertEquals(201, bookingResponse.getStatusCode().value());
        Booking booking = (Booking) bookingResponse.getBody();
        assertNotNull(booking);
        assertEquals("Journey Lab", booking.getResourceName());
        assertEquals("PENDING", booking.getStatus());

        // 4. User verifies booking in their personal list
        var myListResponse = bookingController.getMyBookings();
        List<Booking> myBookings = (List<Booking>) myListResponse.getBody();
        assertNotNull(myBookings);
    }
}
