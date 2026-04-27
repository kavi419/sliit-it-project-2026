package com.springboot.smartcampus.model;

import com.springboot.smartcampus.enums.TicketCategory;
import com.springboot.smartcampus.enums.TicketPriority;
import com.springboot.smartcampus.enums.TicketStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String ticketCode;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(length = 100)
    private String resourceName;

    @Column(length = 100)
    private String preferredContact;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Ticket() {}

    public Ticket(Long id, String ticketCode, String title, String description, TicketCategory category, TicketPriority priority, TicketStatus status, String location, String resourceName, String preferredContact, String rejectionReason, String resolutionNotes, User createdBy, User assignedTechnician, LocalDateTime createdAt, LocalDateTime updatedAt) {
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
        this.assignedTechnician = assignedTechnician;
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
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public User getAssignedTechnician() { return assignedTechnician; }
    public void setAssignedTechnician(User assignedTechnician) { this.assignedTechnician = assignedTechnician; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static TicketBuilder builder() {
        return new TicketBuilder();
    }

    public static class TicketBuilder {
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
        private User createdBy;
        private User assignedTechnician;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public TicketBuilder id(Long id) { this.id = id; return this; }
        public TicketBuilder ticketCode(String ticketCode) { this.ticketCode = ticketCode; return this; }
        public TicketBuilder title(String title) { this.title = title; return this; }
        public TicketBuilder description(String description) { this.description = description; return this; }
        public TicketBuilder category(TicketCategory category) { this.category = category; return this; }
        public TicketBuilder priority(TicketPriority priority) { this.priority = priority; return this; }
        public TicketBuilder status(TicketStatus status) { this.status = status; return this; }
        public TicketBuilder location(String location) { this.location = location; return this; }
        public TicketBuilder resourceName(String resourceName) { this.resourceName = resourceName; return this; }
        public TicketBuilder preferredContact(String preferredContact) { this.preferredContact = preferredContact; return this; }
        public TicketBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public TicketBuilder resolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; return this; }
        public TicketBuilder createdBy(User createdBy) { this.createdBy = createdBy; return this; }
        public TicketBuilder assignedTechnician(User assignedTechnician) { this.assignedTechnician = assignedTechnician; return this; }
        public TicketBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TicketBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Ticket build() {
            return new Ticket(id, ticketCode, title, description, category, priority, status, location, resourceName, preferredContact, rejectionReason, resolutionNotes, createdBy, assignedTechnician, createdAt, updatedAt);
        }
    }
}
