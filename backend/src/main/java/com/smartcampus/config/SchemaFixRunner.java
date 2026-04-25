package com.smartcampus.config;

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
            "ALTER TABLE app_users ALTER COLUMN google_sub DROP NOT NULL",
            "google_sub → nullable"
        );

        // Make updated_at nullable — avoids NOT NULL violation on insert
        runSafe(
            "ALTER TABLE app_users ALTER COLUMN updated_at DROP NOT NULL",
            "updated_at → nullable"
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
