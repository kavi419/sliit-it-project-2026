package com.springboot.smartcampus.dto;

import java.time.LocalDateTime;

public class TicketCommentResponse {
    private Long id;
    private Long ticketId;
    private String authorName;
    private Long authorId;
    private String message;
    private LocalDateTime createdAt;

    public TicketCommentResponse() {}

    public TicketCommentResponse(Long id, Long ticketId, String authorName, Long authorId, String message, LocalDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.authorName = authorName;
        this.authorId = authorId;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static TicketCommentResponseBuilder builder() {
        return new TicketCommentResponseBuilder();
    }

    public static class TicketCommentResponseBuilder {
        private Long id;
        private Long ticketId;
        private String authorName;
        private Long authorId;
        private String message;
        private LocalDateTime createdAt;

        public TicketCommentResponseBuilder id(Long id) { this.id = id; return this; }
        public TicketCommentResponseBuilder ticketId(Long ticketId) { this.ticketId = ticketId; return this; }
        public TicketCommentResponseBuilder authorName(String authorName) { this.authorName = authorName; return this; }
        public TicketCommentResponseBuilder authorId(Long authorId) { this.authorId = authorId; return this; }
        public TicketCommentResponseBuilder message(String message) { this.message = message; return this; }
        public TicketCommentResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TicketCommentResponse build() {
            return new TicketCommentResponse(id, ticketId, authorName, authorId, message, createdAt);
        }
    }
}
