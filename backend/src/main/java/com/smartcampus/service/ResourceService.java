package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.model.ResourceEntity;
import com.smartcampus.repository.ResourceRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<ResourceResponse> searchResources(String query, String type, Integer minCapacity, Integer maxCapacity, String location, ResourceStatus status) {
        Specification<ResourceEntity> specification = (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String likeQuery = "%" + query.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likeQuery),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("type")), likeQuery),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), likeQuery)
                ));
            }

            if (type != null && !type.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("type")), "%" + type.toLowerCase() + "%"));
            }

            if (location != null && !location.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }

            if (minCapacity != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }

            if (maxCapacity != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("capacity"), maxCapacity));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return resourceRepository.findAll(specification).stream().map(this::toResponse).toList();
    }

    public ResourceResponse getResource(Long id) {
        return resourceRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
    }

    public ResourceResponse createResource(ResourceRequest request) {
        validateTimeWindow(request.availableFrom(), request.availableTo());
        ResourceEntity saved = resourceRepository.save(mapToEntity(new ResourceEntity(), request));
        return toResponse(saved);
    }

    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        validateTimeWindow(request.availableFrom(), request.availableTo());
        ResourceEntity resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        return toResponse(resourceRepository.save(mapToEntity(resource, request)));
    }

    public ResourceResponse updateStatus(Long id, ResourceStatus status) {
        ResourceEntity resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        resource.setStatus(status);
        return toResponse(resourceRepository.save(resource));
    }

    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new IllegalArgumentException("Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    private ResourceEntity mapToEntity(ResourceEntity resource, ResourceRequest request) {
        resource.setName(request.name().trim());
        resource.setType(request.type().trim());
        resource.setCapacity(request.capacity());
        resource.setLocation(request.location().trim());
        resource.setStatus(request.status());
        resource.setAvailableFrom(request.availableFrom());
        resource.setAvailableTo(request.availableTo());
        resource.setImageUrl(request.imageUrl());
        resource.setDescription(request.description());
        return resource;
    }

    private ResourceResponse toResponse(ResourceEntity resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getStatus(),
                resource.getAvailableFrom(),
                resource.getAvailableTo(),
                resource.getImageUrl(),
                resource.getDescription(),
                resource.getCreatedAt(),
                resource.getUpdatedAt()
        );
    }

    private void validateTimeWindow(LocalTime from, LocalTime to) {
        if (from != null && to != null && !from.isBefore(to)) {
            throw new IllegalArgumentException("availableFrom must be earlier than availableTo");
        }
    }
}