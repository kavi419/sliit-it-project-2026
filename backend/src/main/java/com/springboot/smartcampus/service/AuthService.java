package com.springboot.smartcampus.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthService {
    ResponseEntity<Boolean> checkEmailExists(Map<String, String> request);
    ResponseEntity<Map<String, String>> register(Map<String, String> request);
    ResponseEntity<Map<String, String>> login(Map<String, String> requestData, HttpServletRequest request, HttpServletResponse response);
}
