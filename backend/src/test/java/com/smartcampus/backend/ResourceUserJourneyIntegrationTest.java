package com.smartcampus.backend;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.model.BookingEntity;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.ResourceService;
import com.smartcampus.controller.BookingController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;

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

    private UserEntity student;

    @BeforeEach
    void setUp() {
        student = new UserEntity();
        student.setId(1L);
        student.setEmail("student@journey.com");
        student.setName("Journey Student");
        student.setRole("USER");
        
        when(userRepository.findByEmail("student@journey.com")).thenReturn(Optional.of(student));
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
        Page<ResourceResponse> searchResults = resourceService.searchResources("Journey", null, null, null, null, null, PageRequest.of(0, 10));
        assertTrue(searchResults.getContent().stream().anyMatch(r -> r.name().equals("Journey Lab")));

        // 3. User books the resource
        Map<String, String> bookingPayload = new HashMap<>();
        bookingPayload.put("resourceId", String.valueOf(created.id()));
        bookingPayload.put("startTime", "2026-05-01T10:00:00");
        bookingPayload.put("endTime", "2026-05-01T12:00:00");

        OAuth2User oauth2User = createMockUser("student@journey.com");
        var bookingResponse = bookingController.createBooking(oauth2User, bookingPayload);
        
        assertEquals(200, bookingResponse.getStatusCode().value());
        BookingEntity booking = (BookingEntity) bookingResponse.getBody();
        assertNotNull(booking);
        assertEquals("Journey Lab", booking.getResourceName());
        assertEquals("PENDING", booking.getStatus());

        // 4. User verifies booking in their list
        var myListResponse = bookingController.getMyBookings(oauth2User);
        List<BookingEntity> myBookings = (List<BookingEntity>) myListResponse.getBody();
        assertNotNull(myBookings);
        assertTrue(myBookings.stream().anyMatch(b -> b.getResourceName().equals("Journey Lab")));
    }

    private OAuth2User createMockUser(String email) {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("email", email);
        attributes.put("sub", "12345");
        return new DefaultOAuth2User(Collections.emptyList(), attributes, "email");
    }
}
