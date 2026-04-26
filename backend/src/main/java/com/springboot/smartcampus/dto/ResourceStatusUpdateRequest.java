package com.springboot.smartcampus.dto;

import com.springboot.smartcampus.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public record ResourceStatusUpdateRequest(
        @NotNull ResourceStatus status
) {
}
