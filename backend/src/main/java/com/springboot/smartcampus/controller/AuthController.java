package com.springboot.smartcampus.controller;

import com.springboot.smartcampus.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestBody Map<String, String> request) {
        return authService.checkEmailExists(request);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> requestData,
            HttpServletRequest request,
            HttpServletResponse response) {
        return authService.login(requestData, request, response);
    }
}
