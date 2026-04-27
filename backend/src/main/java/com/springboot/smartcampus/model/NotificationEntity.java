package com.springboot.smartcampus.model;

import com.springboot.smartcampus.enums.NotificationType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "notifications")
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private boolean isRead = false;

    private Long relatedEntityId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public NotificationEntity() {}

    public NotificationEntity(Long id, Long userId, String message, NotificationType type, boolean isRead, Long relatedEntityId, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.relatedEntityId = relatedEntityId;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static NotificationEntityBuilder builder() {
        return new NotificationEntityBuilder();
    }

    public static class NotificationEntityBuilder {
        private Long id;
        private Long userId;
        private String message;
        private NotificationType type;
        private boolean isRead = false;
        private Long relatedEntityId;
        private LocalDateTime createdAt;

        public NotificationEntityBuilder id(Long id) { this.id = id; return this; }
        public NotificationEntityBuilder userId(Long userId) { this.userId = userId; return this; }
        public NotificationEntityBuilder message(String message) { this.message = message; return this; }
        public NotificationEntityBuilder type(NotificationType type) { this.type = type; return this; }
        public NotificationEntityBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public NotificationEntityBuilder relatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; return this; }
        public NotificationEntityBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public NotificationEntity build() {
            return new NotificationEntity(id, userId, message, type, isRead, relatedEntityId, createdAt);
        }
    }
}
