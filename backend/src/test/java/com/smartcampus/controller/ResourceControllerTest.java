package com.smartcampus.controller;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.dto.ResourceStatusUpdateRequest;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.ResourceService;
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
                null
        );
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
        when(httpServletRequest.getHeader("X-Mock-Role")).thenReturn("USER");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> resourceController.createResource(null, request));

        assertEquals("Admin access required", ex.getMessage());
        verify(resourceService, never()).createResource(any());
    }

    @Test
    void createResource_ShouldAllowAdminWhenUsingMockHeader() {
        when(httpServletRequest.getHeader("X-Mock-Role")).thenReturn("ADMIN");
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(resourceService.createResource(any(ResourceRequest.class))).thenReturn(response);

        ResponseEntity<ResourceResponse> entity = resourceController.createResource(null, request);

        assertEquals(HttpStatus.CREATED, entity.getStatusCode());
        assertNotNull(entity.getBody());
        assertEquals(1L, entity.getBody().id());
        verify(resourceService).createResource(request);
    }

    @Test
    void updateResource_ShouldRejectNonAdminWhenUsingMockHeader() {
        when(httpServletRequest.getHeader("X-Mock-Role")).thenReturn("USER");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> resourceController.updateResource(null, 1L, request));

        assertEquals("Admin access required", ex.getMessage());
        verify(resourceService, never()).updateResource(anyLong(), any());
    }

    @Test
    void updateStatus_ShouldReturnOk() {
        when(httpServletRequest.getHeader("X-Mock-Role")).thenReturn("ADMIN");
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(resourceService.updateStatus(1L, ResourceStatus.MAINTENANCE)).thenReturn(
                new ResourceResponse(1L, "Innovation Lab", "Lab", 35, "Block C",
                        ResourceStatus.MAINTENANCE, null, null, null, null, null, null)
        );

        ResponseEntity<ResourceResponse> entity = resourceController.updateStatus(
                null,
                1L,
                new ResourceStatusUpdateRequest(ResourceStatus.MAINTENANCE)
        );

        assertEquals(HttpStatus.OK, entity.getStatusCode());
        assertEquals(ResourceStatus.MAINTENANCE, entity.getBody().status());
    }
}