package com.smartcampus.dto;

import com.smartcampus.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private Long relatedEntityId;
    private LocalDateTime createdAt;
}
