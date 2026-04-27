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
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=never"
})
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
@Transactional
class ResourceUserJourneyIntegrationTest {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @org.springframework.boot.test.mock.mockito.MockBean
    private UserRepository userRepository;

    @org.springframework.boot.test.mock.mockito.MockBean
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
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(username = "student@journey.com")
    void fullUserJourney_AdminCreates_UserSearchesAndBooks() throws Exception {
        // 1. Admin creates a new resource (calling service directly is fine for admin setup)
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

        // 3. User books the resource via MockMvc to properly handle security context
        String bookingJson = String.format("{\"resourceId\":\"%d\", \"startTime\":\"2026-05-02T10:00:00\", \"endTime\":\"2026-05-02T12:00:00\"}", created.id());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/bookings")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isCreated())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.resourceName").value("Journey Lab"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.status").value("PENDING"));

        // 4. User verifies booking in their personal list
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/bookings/my"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());
    }
}

