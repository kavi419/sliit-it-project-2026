package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA Entity mapped to the app_users table.
 * Supports both Google OAuth2 users (no password) and
 * email/password self-registered users (no googleId).
 */
@Entity
@Table(name = "app_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "google_id", unique = true, columnDefinition = "TEXT")
    private String googleId;

    @Column(nullable = false, length = 30)
    private String role;

    /**
     * BCrypt-hashed password. NULL for Google OAuth2 users.
     */
    @Column(columnDefinition = "TEXT")
    private String password;

    /**
     * Account status.
     * Values: ACTIVE | PENDING_ADMIN
     *
     * IMPORTANT: columnDefinition includes "DEFAULT 'ACTIVE'" so that
     * ddl-auto=update can ALTER the existing app_users table (which already
     * has rows from Google OAuth) without failing the NOT NULL constraint.
     * The @Builder.Default sets the Java-side default; the SQL DEFAULT
     * handles existing rows at migration time.
     */
    @Column(nullable = false, length = 30, columnDefinition = "VARCHAR(30) DEFAULT 'ACTIVE'")
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // Safety guards — ensure required fields are never null at persist time.
        // Protects against the @Builder.Default + @AllArgsConstructor Lombok
        // interaction where the all-args constructor bypasses builder defaults.
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        if (this.role == null) {
            this.role = "STUDENT";
        }
    }
}
