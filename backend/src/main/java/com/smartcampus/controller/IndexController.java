package com.smartcampus.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class IndexController {

    @GetMapping("/")
    public Map<String, String> index() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Smart Campus Hub API is running");
        response.put("status", "UP");
        response.put("frontend_url", "http://localhost:5173");
        return response;
    }
}
