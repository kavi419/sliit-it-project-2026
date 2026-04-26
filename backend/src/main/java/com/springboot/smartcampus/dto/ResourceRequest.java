package com.springboot.smartcampus.dto;

import com.springboot.smartcampus.enums.ResourceStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record ResourceRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 80) String type,
        @NotNull @Min(1) Integer capacity,
        @NotBlank @Size(max = 150) String location,
        @NotNull ResourceStatus status,
        LocalTime availableFrom,
        LocalTime availableTo,
        @Size(max = 500) String imageUrl,
        String description
) {
}
