package com.smartcampus.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs once at startup to apply schema fixes that ddl-auto=update cannot handle
 * (specifically changing NOT NULL columns to NULL).
 *
 * Safe to run repeatedly — uses MODIFY COLUMN which is idempotent.
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
        log.info("SchemaFixRunner: applying schema fixes...");
        try {
            // Make google_sub nullable — email/password users have no Google sub claim
            jdbc.execute(
                "ALTER TABLE app_users MODIFY COLUMN google_sub TEXT NULL"
            );
            log.info("SchemaFixRunner: google_sub → nullable ✓");
        } catch (Exception e) {
            log.warn("SchemaFixRunner: google_sub fix skipped ({})", e.getMessage());
        }

        try {
            // Ensure updated_at has a DB-level default so omitting it on INSERT is safe
            jdbc.execute(
                "ALTER TABLE app_users MODIFY COLUMN updated_at DATETIME NULL " +
                "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
            );
            log.info("SchemaFixRunner: updated_at → nullable with DEFAULT ✓");
        } catch (Exception e) {
            log.warn("SchemaFixRunner: updated_at fix skipped ({})", e.getMessage());
        }

        log.info("SchemaFixRunner: done.");
    }
}
