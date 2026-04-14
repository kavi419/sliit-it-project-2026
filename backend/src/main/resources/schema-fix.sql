-- Fix google_sub column: make it nullable so email/password users can register
-- without a Google sub claim. ddl-auto=update cannot change NOT NULL → NULL,
-- so we do it explicitly here.
ALTER TABLE app_users MODIFY COLUMN google_sub TEXT NULL;

-- Also ensure updated_at is nullable with a DB-level default so Hibernate's
-- INSERT (which omits it) doesn't violate NOT NULL.
ALTER TABLE app_users MODIFY COLUMN updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
