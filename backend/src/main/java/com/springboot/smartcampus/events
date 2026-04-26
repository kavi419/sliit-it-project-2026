package com.smartcampus.events;

import com.smartcampus.enums.NotificationType;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NotificationEvent extends ApplicationEvent {
    
    private final Long userId;
    private final String message;
    private final NotificationType type;
    private final Long relatedEntityId;

    public NotificationEvent(Object source, Long userId, String message, NotificationType type, Long relatedEntityId) {
        super(source);
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.relatedEntityId = relatedEntityId;
    }
}
