package com.springboot.smartcampus.dto;

import com.springboot.smartcampus.enums.ResourceStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record ResourceResponse(
        Long id,
        String name,
        String type,
        Integer capacity,
        String location,
        ResourceStatus status,
        LocalTime availableFrom,
        LocalTime availableTo,
        String imageUrl,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime nextAvailableSlot,
        Double occupancyProgress
) {
}
