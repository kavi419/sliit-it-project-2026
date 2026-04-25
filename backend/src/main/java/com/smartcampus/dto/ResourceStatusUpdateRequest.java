package com.smartcampus.dto;

import com.smartcampus.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public record ResourceStatusUpdateRequest(
        @NotNull ResourceStatus status
) {
}