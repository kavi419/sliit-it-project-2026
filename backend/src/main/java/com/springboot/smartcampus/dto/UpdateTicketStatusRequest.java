package com.springboot.smartcampus.dto;

import com.springboot.smartcampus.enums.TicketStatus;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    private TicketStatus status;
    private String rejectionReason;
}
