package com.springboot.smartcampus.dto;

import com.springboot.smartcampus.enums.TicketCategory;
import com.springboot.smartcampus.enums.TicketPriority;
import lombok.Data;

@Data
public class CreateTicketRequest {
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private String location;
    private String resourceName;
    private String preferredContact;
}
