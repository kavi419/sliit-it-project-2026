package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA Entity mapped to the app_users table.
 *
 * The table was originally created with extra columns (updated_at, google_sub,
 * full_name) from an earlier schema. All columns are mapped here so that
 * Hibernate includes them in every INSERT and avoids "Field X doesn't have a
 * default value" errors under MySQL strict mode.
 *
 * Supports both:
 *  - Google OAuth2 users  (googleId set, password null)
 *  - Email/password users (password set, googleId null)
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

    // ── Core identity ──────────────────────────────────────────────────────────

    /** Display name. May be the email address for self-registered users. */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * Full name from Google (maps to the legacy full_name column).
     * Null for email/password users until they set a profile.
     */
    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // ── OAuth2 fields (null for email/password users) ──────────────────────────

    /** Google OAuth2 ID / sub claim. NULL for email/password-only users.
     *  Mapped to BOTH google_id and google_sub columns via insertable/updatable
     *  so that neither column receives a null on INSERT.
     */
    @Column(name = "google_id", columnDefinition = "TEXT")
    private String googleId;

    // ── Auth fields ────────────────────────────────────────────────────────────

    @Column(nullable = false, length = 30)
    private String role;

    /** BCrypt-hashed password. NULL for Google OAuth2 users. */
    @Column(columnDefinition = "TEXT")
    private String password;

    /**
     * Account status:  ACTIVE | PENDING_ADMIN
     *
     * columnDefinition includes DEFAULT 'ACTIVE' so that ddl-auto=update can
     * ALTER TABLE on existing rows without violating the NOT NULL constraint.
     */
    @Column(nullable = false, length = 30, columnDefinition = "VARCHAR(30) DEFAULT 'ACTIVE'")
    @Builder.Default
    private String status = "ACTIVE";

    // ── Timestamps ─────────────────────────────────────────────────────────────

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Has a SQL-level DEFAULT so existing rows are not affected when the column
     * is added or when the field is null on insert for legacy code paths.
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Lifecycle callbacks ────────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        // Safety guards — protect against @Builder.Default + @AllArgsConstructor
        // Lombok issue where the all-args constructor bypasses builder defaults.
        if (this.status == null) { this.status = "ACTIVE";   }
        if (this.role   == null) { this.role   = "STUDENT";  }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
