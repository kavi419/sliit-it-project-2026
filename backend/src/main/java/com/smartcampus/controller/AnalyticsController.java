package com.smartcampus.controller;

import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @GetMapping("/resource-usage")
    public ResponseEntity<Map<String, Object>> getResourceUsage() {
        Map<String, Object> data = new HashMap<>();

        // 1. Most Booked Resources
        List<Object[]> resourceStats = bookingRepository.countBookingsByResource();
        List<Map<String, Object>> resourceUsageList = resourceStats.stream().limit(5).map(stat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", stat[0]);
            map.put("count", stat[1]);
            return map;
        }).collect(Collectors.toList());
        data.put("topResources", resourceUsageList);

        // 2. Weekly Trends
        List<Object[]> weeklyStats = bookingRepository.countBookingsByDayOfWeek();
        List<Map<String, Object>> weeklyTrendsList = weeklyStats.stream().map(stat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("day", stat[0]);
            map.put("count", stat[1]);
            return map;
        }).collect(Collectors.toList());
        data.put("weeklyTrends", weeklyTrendsList);

        // 3. Status Overview
        long totalResources = resourceRepository.count();
        data.put("totalResources", totalResources);
        data.put("totalBookings", bookingRepository.count());

        return ResponseEntity.ok(data);
    }
}
