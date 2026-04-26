package com.springboot.smartcampus.service;

import com.springboot.smartcampus.dto.NotificationDTO;
import com.springboot.smartcampus.enums.NotificationType;
import com.springboot.smartcampus.model.NotificationEntity;
import com.springboot.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(Long userId, String message, NotificationType type, Long relatedEntityId) {
        NotificationEntity notification = NotificationEntity.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .isRead(false)
                .relatedEntityId(relatedEntityId)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public int getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(Long userId) {
        List<NotificationEntity> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        notificationRepository.delete(notification);
    }

    private NotificationDTO mapToDTO(NotificationEntity entity) {
        return NotificationDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .message(entity.getMessage())
                .type(entity.getType())
                .isRead(entity.isRead())
                .relatedEntityId(entity.getRelatedEntityId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
