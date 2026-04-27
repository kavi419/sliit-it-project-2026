package com.springboot.smartcampus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_comments")
public class TicketComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public TicketComment() {}

    public TicketComment(Long id, Ticket ticket, User author, String message, LocalDateTime createdAt) {
        this.id = id;
        this.ticket = ticket;
        this.author = author;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public static TicketCommentBuilder builder() {
        return new TicketCommentBuilder();
    }

    public static class TicketCommentBuilder {
        private Long id;
        private Ticket ticket;
        private User author;
        private String message;
        private LocalDateTime createdAt;

        public TicketCommentBuilder id(Long id) { this.id = id; return this; }
        public TicketCommentBuilder ticket(Ticket ticket) { this.ticket = ticket; return this; }
        public TicketCommentBuilder author(User author) { this.author = author; return this; }
        public TicketCommentBuilder message(String message) { this.message = message; return this; }
        public TicketCommentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TicketComment build() {
            return new TicketComment(id, ticket, author, message, createdAt);
        }
    }
}
