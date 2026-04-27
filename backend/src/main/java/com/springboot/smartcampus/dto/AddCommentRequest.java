package com.springboot.smartcampus.dto;

public class AddCommentRequest {
    private String message;

    public AddCommentRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
