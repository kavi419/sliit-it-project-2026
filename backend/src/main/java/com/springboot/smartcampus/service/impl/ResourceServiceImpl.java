package com.springboot.smartcampus.service.impl;

import com.springboot.smartcampus.dto.ResourceRequest;
import com.springboot.smartcampus.dto.ResourceResponse;
import com.springboot.smartcampus.enums.ResourceStatus;
import com.springboot.smartcampus.model.Resource;
import com.springboot.smartcampus.model.Booking;
import com.springboot.smartcampus.repository.ResourceRepository;
import com.springboot.smartcampus.repository.BookingRepository;
import com.springboot.smartcampus.service.ResourceService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    @Override
    public Page<ResourceResponse> searchResources(String query, String type, Integer minCapacity, Integer maxCapacity, String location, ResourceStatus status, Pageable pageable) {
        Specification<Resource> specification = (root, criteriaQuery, criteriaBuilder) -> {
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

        return resourceRepository.findAll(specification, pageable).map(this::toResponse);
    }

    @Override
    public ResourceResponse getResource(Long id) {
        return resourceRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
    }

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        validateTimeWindow(request.availableFrom(), request.availableTo());
        Resource saved = resourceRepository.save(mapToEntity(new Resource(), request));
        return toResponse(saved);
    }

    @Override
    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        validateTimeWindow(request.availableFrom(), request.availableTo());
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        return toResponse(resourceRepository.save(mapToEntity(resource, request)));
    }

    @Override
    public ResourceResponse updateStatus(Long id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        resource.setStatus(status);
        return toResponse(resourceRepository.save(resource));
    }

    @Override
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new IllegalArgumentException("Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    private Resource mapToEntity(Resource resource, ResourceRequest request) {
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

    private ResourceResponse toResponse(Resource resource) {
        java.time.LocalDateTime nextAvailable = null;
        Double occupancyProgress = 0.0;
        if (resource.getStatus() == ResourceStatus.ACTIVE) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                resource.getName(), now, now.plusSeconds(1)
            );
            if (!overlaps.isEmpty()) {
                Booking active = overlaps.get(0);
                nextAvailable = overlaps.stream()
                    .map(Booking::getEndTime)
                    .max(java.time.LocalDateTime::compareTo)
                    .orElse(null);
                
                long total = java.time.Duration.between(active.getStartTime(), active.getEndTime()).toSeconds();
                long elapsed = java.time.Duration.between(active.getStartTime(), now).toSeconds();
                if (total > 0) {
                    occupancyProgress = Math.min(100.0, Math.max(0.0, (elapsed * 100.0) / total));
                }
            }
        }

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
                resource.getUpdatedAt(),
                nextAvailable,
                occupancyProgress
        );
    }

    private void validateTimeWindow(LocalTime from, LocalTime to) {
        if (from != null && to != null && !from.isBefore(to)) {
            throw new IllegalArgumentException("availableFrom must be earlier than availableTo");
        }
    }
}
