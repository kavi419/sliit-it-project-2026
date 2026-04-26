package com.springboot.smartcampus.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketCommentResponse {
    private Long id;
    private Long ticketId;
    private String authorName;
    private Long authorId;
    private String message;
    private LocalDateTime createdAt;
}
