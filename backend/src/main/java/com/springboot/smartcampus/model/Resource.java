package com.springboot.smartcampus.model;

import com.springboot.smartcampus.enums.ResourceStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 80)
    private String type;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false, length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Column(name = "available_from")
    private LocalTime availableFrom;

    @Column(name = "available_to")
    private LocalTime availableTo;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Resource() {}

    public Resource(Long id, String name, String type, Integer capacity, String location, ResourceStatus status, LocalTime availableFrom, LocalTime availableTo, String imageUrl, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.imageUrl = imageUrl;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }
    public LocalTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalTime availableFrom) { this.availableFrom = availableFrom; }
    public LocalTime getAvailableTo() { return availableTo; }
    public void setAvailableTo(LocalTime availableTo) { this.availableTo = availableTo; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = ResourceStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static ResourceBuilder builder() {
        return new ResourceBuilder();
    }

    public static class ResourceBuilder {
        private Long id;
        private String name;
        private String type;
        private Integer capacity;
        private String location;
        private ResourceStatus status = ResourceStatus.ACTIVE;
        private LocalTime availableFrom;
        private LocalTime availableTo;
        private String imageUrl;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ResourceBuilder id(Long id) { this.id = id; return this; }
        public ResourceBuilder name(String name) { this.name = name; return this; }
        public ResourceBuilder type(String type) { this.type = type; return this; }
        public ResourceBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public ResourceBuilder location(String location) { this.location = location; return this; }
        public ResourceBuilder status(ResourceStatus status) { this.status = status; return this; }
        public ResourceBuilder availableFrom(LocalTime availableFrom) { this.availableFrom = availableFrom; return this; }
        public ResourceBuilder availableTo(LocalTime availableTo) { this.availableTo = availableTo; return this; }
        public ResourceBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ResourceBuilder description(String description) { this.description = description; return this; }
        public ResourceBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ResourceBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Resource build() {
            return new Resource(id, name, type, capacity, location, status, availableFrom, availableTo, imageUrl, description, createdAt, updatedAt);
        }
    }
}
