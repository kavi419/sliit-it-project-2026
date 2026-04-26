package com.springboot.smartcampus.controller;

import com.springboot.smartcampus.dto.ResourceRequest;
import com.springboot.smartcampus.dto.ResourceResponse;
import com.springboot.smartcampus.dto.ResourceStatusUpdateRequest;
import com.springboot.smartcampus.enums.ResourceStatus;
import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.repository.UserRepository;
import com.springboot.smartcampus.service.ResourceService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceControllerTest {

    @Mock
    private ResourceService resourceService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest httpServletRequest;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ResourceController resourceController;

    private ResourceRequest request;
    private ResourceResponse response;

    @BeforeEach
    void setUp() {
        request = new ResourceRequest(
                "Innovation Lab",
                "Lab",
                35,
                "Block C",
                ResourceStatus.ACTIVE,
                null,
                null,
                null,
                "Student innovation space"
        );

        response = new ResourceResponse(
                1L,
                "Innovation Lab",
                "Lab",
                35,
                "Block C",
                ResourceStatus.ACTIVE,
                null,
                null,
                null,
                "Student innovation space",
                null,
                null,
                null,
                0.0
        );

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void searchResources_ShouldReturnOkWithResults() {
        when(resourceService.searchResources(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(response)));

        ResponseEntity<Page<ResourceResponse>> entity = resourceController.searchResources(
                "lab", null, null, null, null, null, PageRequest.of(0, 10));

        assertEquals(HttpStatus.OK, entity.getStatusCode());
        assertNotNull(entity.getBody());
        assertEquals(1, entity.getBody().getContent().size());
    }

    @Test
    void createResource_ShouldRejectNonAdminWhenUsingMockHeader() {
        when(securityContext.getAuthentication()).thenReturn(null);
        when(httpServletRequest.getHeader("X-Mock-Role")).thenReturn("USER");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> resourceController.createResource(request));

        assertEquals("Admin access required", ex.getMessage());
        verify(resourceService, never()).createResource(any());
    }

    @Test
    void createResource_ShouldAllowAdminWhenUsingMockHeader() {
        when(securityContext.getAuthentication()).thenReturn(null);
        when(httpServletRequest.getHeader("X-Mock-Role")).thenReturn("ADMIN");
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(resourceService.createResource(any(ResourceRequest.class))).thenReturn(response);

        ResponseEntity<ResourceResponse> entity = resourceController.createResource(request);

        assertEquals(HttpStatus.CREATED, entity.getStatusCode());
        assertNotNull(entity.getBody());
        assertEquals(1L, entity.getBody().id());
        verify(resourceService).createResource(request);
    }

    @Test
    void createResource_ShouldAllowAdminWhenAuthenticatedAsAdmin() {
        User adminUser = new User();
        adminUser.setEmail("real-admin@test.com");
        adminUser.setRole("ADMIN");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("real-admin@test.com");
        when(userRepository.findByEmail("real-admin@test.com")).thenReturn(Optional.of(adminUser));
        when(resourceService.createResource(any(ResourceRequest.class))).thenReturn(response);

        ResponseEntity<ResourceResponse> entity = resourceController.createResource(request);

        assertEquals(HttpStatus.CREATED, entity.getStatusCode());
        verify(resourceService).createResource(request);
    }

    @Test
    void updateResource_ShouldRejectNonAdminWhenUsingMockHeader() {
        when(securityContext.getAuthentication()).thenReturn(null);
        when(httpServletRequest.getHeader("X-Mock-Role")).thenReturn("USER");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> resourceController.updateResource(1L, request));

        assertEquals("Admin access required", ex.getMessage());
        verify(resourceService, never()).updateResource(anyLong(), any());
    }

    @Test
    void updateStatus_ShouldReturnOk() {
        when(securityContext.getAuthentication()).thenReturn(null);
        when(httpServletRequest.getHeader("X-Mock-Role")).thenReturn("ADMIN");
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(resourceService.updateStatus(1L, ResourceStatus.MAINTENANCE)).thenReturn(
                new ResourceResponse(1L, "Innovation Lab", "Lab", 35, "Block C",
                        ResourceStatus.MAINTENANCE, null, null, null, null, null, null, null, 0.0)
        );

        ResponseEntity<ResourceResponse> entity = resourceController.updateStatus(
                1L,
                new ResourceStatusUpdateRequest(ResourceStatus.MAINTENANCE)
        );

        assertEquals(HttpStatus.OK, entity.getStatusCode());
        assertEquals(ResourceStatus.MAINTENANCE, entity.getBody().status());
    }
}
