package com.springboot.smartcampus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "resource_name", nullable = false, length = 100)
    private String resourceName;

    @Column(nullable = false, length = 500)
    private String purpose;

    @Column(name = "attendees_count")
    private Integer attendeesCount;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "admin_reason", length = 500)
    private String adminReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Booking() {}

    public Booking(Long id, User user, String resourceName, String purpose, Integer attendeesCount, LocalDateTime startTime, LocalDateTime endTime, String status, String adminReason, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.resourceName = resourceName;
        this.purpose = purpose;
        this.attendeesCount = attendeesCount;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.adminReason = adminReason;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public Integer getAttendeesCount() { return attendeesCount; }
    public void setAttendeesCount(Integer attendeesCount) { this.attendeesCount = attendeesCount; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminReason() { return adminReason; }
    public void setAdminReason(String adminReason) { this.adminReason = adminReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    public static BookingBuilder builder() {
        return new BookingBuilder();
    }

    public static class BookingBuilder {
        private Long id;
        private User user;
        private String resourceName;
        private String purpose;
        private Integer attendeesCount;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String status;
        private String adminReason;
        private LocalDateTime createdAt;

        public BookingBuilder id(Long id) { this.id = id; return this; }
        public BookingBuilder user(User user) { this.user = user; return this; }
        public BookingBuilder resourceName(String resourceName) { this.resourceName = resourceName; return this; }
        public BookingBuilder purpose(String purpose) { this.purpose = purpose; return this; }
        public BookingBuilder attendeesCount(Integer attendeesCount) { this.attendeesCount = attendeesCount; return this; }
        public BookingBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public BookingBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public BookingBuilder status(String status) { this.status = status; return this; }
        public BookingBuilder adminReason(String adminReason) { this.adminReason = adminReason; return this; }
        public BookingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Booking build() {
            return new Booking(id, user, resourceName, purpose, attendeesCount, startTime, endTime, status, adminReason, createdAt);
        }
    }
}
