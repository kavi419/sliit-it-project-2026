package com.springboot.smartcampus.service.impl;

import com.springboot.smartcampus.repository.BookingRepository;
import com.springboot.smartcampus.repository.ResourceRepository;
import com.springboot.smartcampus.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public AnalyticsServiceImpl(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    @Override
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
