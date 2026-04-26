package com.springboot.smartcampus.dto;

import com.springboot.smartcampus.enums.TicketCategory;
import com.springboot.smartcampus.enums.TicketPriority;
import com.springboot.smartcampus.enums.TicketStatus;
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
