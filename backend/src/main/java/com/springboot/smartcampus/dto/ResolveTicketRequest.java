package com.springboot.smartcampus.dto;

public class ResolveTicketRequest {
    private String resolutionNotes;

    public ResolveTicketRequest() {}

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
