package com.smartcampus.model;

import java.time.LocalDateTime;

/**
 * Immutable record representing a user in the app_users table.
 * Used as a DTO to transfer user data between layers.
 */
public record User(
        Long id,
        String username,
        String email,
        String passwordHash,
        String role,
        LocalDateTime createdAt
) {}
