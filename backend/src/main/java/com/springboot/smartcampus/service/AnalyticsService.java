package com.springboot.smartcampus.service;

import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AnalyticsService {
    ResponseEntity<Map<String, Object>> getResourceUsage();
}
