package com.smartcampus.dto;

import com.smartcampus.enums.TicketStatus;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    private TicketStatus status;
    private String rejectionReason;
}
