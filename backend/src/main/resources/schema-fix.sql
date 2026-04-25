-- Fix google_sub column: make it nullable so email/password users can register
-- without a Google sub claim.
ALTER TABLE app_users ALTER COLUMN google_sub DROP NOT NULL;

-- Also ensure updated_at is nullable with a DB-level default
ALTER TABLE app_users ALTER COLUMN updated_at DROP NOT NULL;
ALTER TABLE app_users ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
