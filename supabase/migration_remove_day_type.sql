-- ============================================================
-- Overlift — Remove day_type, use name as single source of truth
-- Run this in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Rename workout_sessions.day_type → day_name
--    Existing values (lowercase like 'push') will be title-cased.
ALTER TABLE workout_sessions RENAME COLUMN day_type TO day_name;

-- Title-case existing session day names to match program day names
UPDATE workout_sessions SET day_name = INITCAP(day_name);

-- Widen the column to match new name lengths (was VARCHAR(20))
ALTER TABLE workout_sessions ALTER COLUMN day_name TYPE VARCHAR(100);

-- 2. Drop day_type from user_program_days
--    Ensure name is populated first (it should already be for all rows)
UPDATE user_program_days SET name = INITCAP(day_type) WHERE name IS NULL;
ALTER TABLE user_program_days ALTER COLUMN name SET NOT NULL;
ALTER TABLE user_program_days DROP COLUMN day_type;

-- 3. Drop day_type from template_days
UPDATE template_days SET name = INITCAP(day_type) WHERE name IS NULL;
ALTER TABLE template_days ALTER COLUMN name SET NOT NULL;
ALTER TABLE template_days DROP COLUMN day_type;
