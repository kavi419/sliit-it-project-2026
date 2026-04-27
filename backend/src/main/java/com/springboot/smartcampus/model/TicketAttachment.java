package com.springboot.smartcampus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_attachments")
public class TicketAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 500)
    private String filePath;

    @Column(nullable = false, length = 100)
    private String contentType;

    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    public TicketAttachment() {}

    public TicketAttachment(Long id, Ticket ticket, String fileName, String filePath, String contentType, LocalDateTime uploadedAt) {
        this.id = id;
        this.ticket = ticket;
        this.fileName = fileName;
        this.filePath = filePath;
        this.contentType = contentType;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }

    public static TicketAttachmentBuilder builder() {
        return new TicketAttachmentBuilder();
    }

    public static class TicketAttachmentBuilder {
        private Long id;
        private Ticket ticket;
        private String fileName;
        private String filePath;
        private String contentType;
        private LocalDateTime uploadedAt;

        public TicketAttachmentBuilder id(Long id) { this.id = id; return this; }
        public TicketAttachmentBuilder ticket(Ticket ticket) { this.ticket = ticket; return this; }
        public TicketAttachmentBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public TicketAttachmentBuilder filePath(String filePath) { this.filePath = filePath; return this; }
        public TicketAttachmentBuilder contentType(String contentType) { this.contentType = contentType; return this; }
        public TicketAttachmentBuilder uploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; return this; }

        public TicketAttachment build() {
            return new TicketAttachment(id, ticket, fileName, filePath, contentType, uploadedAt);
        }
    }
}
