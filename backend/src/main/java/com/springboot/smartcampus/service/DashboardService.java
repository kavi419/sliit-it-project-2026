package com.springboot.smartcampus.service;

import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;

public interface DashboardService {
    ResponseEntity<Map<String, Object>> getDashboardData(OAuth2User oauthUser);
    ResponseEntity<Map<String, Object>> getUserMe(OAuth2User oauthUser, String email);
    ResponseEntity<List<Map<String, Object>>> getPendingUsers();
    ResponseEntity<Map<String, String>> approveUser(Long id);
    ResponseEntity<Map<String, String>> rejectUser(Long id);
}
