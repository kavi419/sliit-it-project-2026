package com.springboot.smartcampus.service;

import com.springboot.smartcampus.dto.NotificationDTO;
import com.springboot.smartcampus.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void createNotification(Long userId, String message, NotificationType type, Long relatedEntityId);
    List<NotificationDTO> getUserNotifications(Long userId);
    int getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId, Long userId);
}
