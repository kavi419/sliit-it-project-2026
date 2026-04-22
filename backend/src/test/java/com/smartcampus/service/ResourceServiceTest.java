package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.model.ResourceEntity;
import com.smartcampus.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private ResourceRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new ResourceRequest(
                " IoT Lab ",
                " Lab ",
                40,
                " Block A ",
                ResourceStatus.ACTIVE,
                LocalTime.of(8, 0),
                LocalTime.of(18, 0),
                "https://example.com/lab.jpg",
                "Primary lab space"
        );
    }

    @Test
    void createResource_ShouldTrimAndPersistRequestFields() {
        when(resourceRepository.save(any(ResourceEntity.class))).thenAnswer(invocation -> {
            ResourceEntity entity = invocation.getArgument(0);
            entity.setId(10L);
            return entity;
        });

        ResourceResponse response = resourceService.createResource(validRequest);

        ArgumentCaptor<ResourceEntity> captor = ArgumentCaptor.forClass(ResourceEntity.class);
        verify(resourceRepository).save(captor.capture());
        ResourceEntity savedEntity = captor.getValue();

        assertEquals("IoT Lab", savedEntity.getName());
        assertEquals("Lab", savedEntity.getType());
        assertEquals("Block A", savedEntity.getLocation());
        assertEquals(40, savedEntity.getCapacity());
        assertEquals(ResourceStatus.ACTIVE, savedEntity.getStatus());
        assertEquals(10L, response.id());
    }

    @Test
    void createResource_ShouldRejectInvalidTimeWindow() {
        ResourceRequest badRequest = new ResourceRequest(
                "Hall 1",
                "Hall",
                100,
                "Main Building",
                ResourceStatus.ACTIVE,
                LocalTime.of(10, 0),
                LocalTime.of(9, 0),
                null,
                null
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> resourceService.createResource(badRequest));

        assertEquals("availableFrom must be earlier than availableTo", ex.getMessage());
        verify(resourceRepository, never()).save(any());
    }

    @Test
    void deleteResource_ShouldThrowWhenResourceMissing() {
        when(resourceRepository.existsById(88L)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> resourceService.deleteResource(88L));

        assertEquals("Resource not found", ex.getMessage());
        verify(resourceRepository, never()).deleteById(any());
    }

    @Test
    void updateStatus_ShouldReturnUpdatedResource() {
        ResourceEntity entity = ResourceEntity.builder()
                .id(5L)
                .name("Studio")
                .type("Room")
                .capacity(20)
                .location("Block B")
                .status(ResourceStatus.ACTIVE)
                .build();

        when(resourceRepository.findById(5L)).thenReturn(Optional.of(entity));
        when(resourceRepository.save(any(ResourceEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResourceResponse response = resourceService.updateStatus(5L, ResourceStatus.MAINTENANCE);

        assertEquals(ResourceStatus.MAINTENANCE, response.status());
        verify(resourceRepository).save(entity);
    }

    @Test
    void searchResources_ShouldMapRepositoryEntitiesToResponses() {
        ResourceEntity entity = ResourceEntity.builder()
                .id(1L)
                .name("Seminar Hall")
                .type("Hall")
                .capacity(120)
                .location("Main Campus")
                .status(ResourceStatus.ACTIVE)
                .build();

        when(resourceRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(List.of(entity));

        List<ResourceResponse> results = resourceService.searchResources("hall", null, null, null, null, null);

        assertEquals(1, results.size());
        assertEquals("Seminar Hall", results.get(0).name());
    }
}