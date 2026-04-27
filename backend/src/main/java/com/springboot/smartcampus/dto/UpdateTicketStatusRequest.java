package com.springboot.smartcampus.dto;

import com.springboot.smartcampus.enums.TicketStatus;

public class UpdateTicketStatusRequest {
    private TicketStatus status;
    private String rejectionReason;

    public UpdateTicketStatusRequest() {}

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
