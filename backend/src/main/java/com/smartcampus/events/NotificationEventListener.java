package com.smartcampus.events;

import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        // Triggered asynchronously or synchronously when a NotificationEvent is published
        notificationService.createNotification(
                event.getUserId(),
                event.getMessage(),
                event.getType(),
                event.getRelatedEntityId()
        );
    }
}
