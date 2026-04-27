package com.springboot.smartcampus.dto;

import java.time.LocalDateTime;

public class TicketAttachmentResponse {
    private Long id;
    private Long ticketId;
    private String fileName;
    private String url;
    private LocalDateTime uploadedAt;

    public TicketAttachmentResponse() {}

    public TicketAttachmentResponse(Long id, Long ticketId, String fileName, String url, LocalDateTime uploadedAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.fileName = fileName;
        this.url = url;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public static TicketAttachmentResponseBuilder builder() {
        return new TicketAttachmentResponseBuilder();
    }

    public static class TicketAttachmentResponseBuilder {
        private Long id;
        private Long ticketId;
        private String fileName;
        private String url;
        private LocalDateTime uploadedAt;

        public TicketAttachmentResponseBuilder id(Long id) { this.id = id; return this; }
        public TicketAttachmentResponseBuilder ticketId(Long ticketId) { this.ticketId = ticketId; return this; }
        public TicketAttachmentResponseBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public TicketAttachmentResponseBuilder url(String url) { this.url = url; return this; }
        public TicketAttachmentResponseBuilder uploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; return this; }

        public TicketAttachmentResponse build() {
            return new TicketAttachmentResponse(id, ticketId, fileName, url, uploadedAt);
        }
    }
}
