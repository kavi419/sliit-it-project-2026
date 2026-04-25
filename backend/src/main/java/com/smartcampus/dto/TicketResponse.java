package com.smartcampus.dto;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private String ticketCode;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String location;
    private String resourceName;
    private String preferredContact;
    private String rejectionReason;
    private String resolutionNotes;
    private String createdBy;
    private Long createdById;
    private String assignedTechnician;
    private Long assignedTechnicianId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
