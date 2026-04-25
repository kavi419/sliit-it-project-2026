package com.smartcampus.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketAttachmentResponse {
    private Long id;
    private Long ticketId;
    private String fileName;
    private String url;
    private LocalDateTime uploadedAt;
}
