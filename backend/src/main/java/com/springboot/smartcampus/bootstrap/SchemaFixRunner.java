package com.springboot.smartcampus.bootstrap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs once at startup to apply schema fixes that ddl-auto=update cannot handle.
 *
 * Uses standard PostgreSQL ALTER TABLE syntax (compatible with Supabase).
 * Safe to run repeatedly — all statements catch exceptions and log a warning on skip.
 */
@Component
public class SchemaFixRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaFixRunner.class);
    private final JdbcTemplate jdbc;

    public SchemaFixRunner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("SchemaFixRunner: applying PostgreSQL schema fixes...");

        // Make google_sub nullable — email/password users have no Google sub claim
        runSafe(
            "ALTER TABLE app_users ALTER COLUMN google_id DROP NOT NULL",
            "google_id → nullable"
        );

        // Make updated_at nullable — avoids NOT NULL violation on insert
        runSafe(
            "ALTER TABLE app_users ALTER COLUMN updated_at DROP NOT NULL",
            "updated_at → nullable"
        );

        // Add related_entity_id to notifications if missing
        runSafe(
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_id BIGINT",
            "notifications.related_entity_id added"
        );

        // Drop old notifications_type_check constraint and recreate with USER_REGISTRATION
        runSafe(
            "ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check",
            "notifications_type_check constraint dropped"
        );
        runSafe(
            "ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN " +
            "('BOOKING_APPROVED','BOOKING_REJECTED','BOOKING_UPDATE','TICKET_UPDATE','NEW_COMMENT','SYSTEM_ALERT','USER_REGISTRATION'))",
            "notifications_type_check constraint recreated with USER_REGISTRATION"
        );

        log.info("SchemaFixRunner: done.");
    }

    private void runSafe(String sql, String description) {
        try {
            jdbc.execute(sql);
            log.info("SchemaFixRunner: {} ✓", description);
        } catch (Exception e) {
            // Column may already be nullable — this is safe to ignore
            log.warn("SchemaFixRunner: {} skipped ({})", description, e.getMessage());
        }
    }
}
