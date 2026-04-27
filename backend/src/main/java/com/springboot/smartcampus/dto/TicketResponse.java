package com.springboot.smartcampus.dto;

import com.springboot.smartcampus.enums.TicketCategory;
import com.springboot.smartcampus.enums.TicketPriority;
import com.springboot.smartcampus.enums.TicketStatus;
import java.time.LocalDateTime;

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

    public TicketResponse() {}

    public TicketResponse(Long id, String ticketCode, String title, String description, TicketCategory category, TicketPriority priority, TicketStatus status, String location, String resourceName, String preferredContact, String rejectionReason, String resolutionNotes, String createdBy, Long createdById, String assignedTechnician, Long assignedTechnicianId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.ticketCode = ticketCode;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.location = location;
        this.resourceName = resourceName;
        this.preferredContact = preferredContact;
        this.rejectionReason = rejectionReason;
        this.resolutionNotes = resolutionNotes;
        this.createdBy = createdBy;
        this.createdById = createdById;
        this.assignedTechnician = assignedTechnician;
        this.assignedTechnicianId = assignedTechnicianId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    public String getPreferredContact() { return preferredContact; }
    public void setPreferredContact(String preferredContact) { this.preferredContact = preferredContact; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }
    public String getAssignedTechnician() { return assignedTechnician; }
    public void setAssignedTechnician(String assignedTechnician) { this.assignedTechnician = assignedTechnician; }
    public Long getAssignedTechnicianId() { return assignedTechnicianId; }
    public void setAssignedTechnicianId(Long assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static TicketResponseBuilder builder() {
        return new TicketResponseBuilder();
    }

    public static class TicketResponseBuilder {
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

        public TicketResponseBuilder id(Long id) { this.id = id; return this; }
        public TicketResponseBuilder ticketCode(String ticketCode) { this.ticketCode = ticketCode; return this; }
        public TicketResponseBuilder title(String title) { this.title = title; return this; }
        public TicketResponseBuilder description(String description) { this.description = description; return this; }
        public TicketResponseBuilder category(TicketCategory category) { this.category = category; return this; }
        public TicketResponseBuilder priority(TicketPriority priority) { this.priority = priority; return this; }
        public TicketResponseBuilder status(TicketStatus status) { this.status = status; return this; }
        public TicketResponseBuilder location(String location) { this.location = location; return this; }
        public TicketResponseBuilder resourceName(String resourceName) { this.resourceName = resourceName; return this; }
        public TicketResponseBuilder preferredContact(String preferredContact) { this.preferredContact = preferredContact; return this; }
        public TicketResponseBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public TicketResponseBuilder resolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; return this; }
        public TicketResponseBuilder createdBy(String createdBy) { this.createdBy = createdBy; return this; }
        public TicketResponseBuilder createdById(Long createdById) { this.createdById = createdById; return this; }
        public TicketResponseBuilder assignedTechnician(String assignedTechnician) { this.assignedTechnician = assignedTechnician; return this; }
        public TicketResponseBuilder assignedTechnicianId(Long assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; return this; }
        public TicketResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TicketResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public TicketResponse build() {
            return new TicketResponse(id, ticketCode, title, description, category, priority, status, location, resourceName, preferredContact, rejectionReason, resolutionNotes, createdBy, createdById, assignedTechnician, assignedTechnicianId, createdAt, updatedAt);
        }
    }
}
