-- TAHAP 10: MIGRATE target_division (singular) ke target_divisions (JSON array)
-- File: scripts/10-migrate-to-target-divisions-json.sql
-- Deskripsi: Mengganti kolom target_division menjadi target_divisions (JSON array)

USE sistem_helpdesk_nlp;

-- Backup kolom lama ke kolom temporary
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS old_target_division_backup VARCHAR(100);
UPDATE tickets SET old_target_division_backup = target_division WHERE old_target_division_backup IS NULL;

-- Tambah kolom target_divisions (JSON array)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS target_divisions JSON COMMENT 'Array divisi tujuan dari hasil NLP + user division';

-- Tambah kolom user_division untuk track divisi pembuat ticket
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_division VARCHAR(100) COMMENT 'Divisi pembuat ticket';

-- Tambah kolom nlp_category untuk track kategori hasil NLP
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS nlp_category VARCHAR(100) COMMENT 'Kategori hasil klasifikasi NLP';

-- Migrate data: convert target_division (string) ke target_divisions (JSON array)
UPDATE tickets
SET target_divisions = JSON_ARRAY(COALESCE(target_division, 'IT'))
WHERE target_divisions IS NULL;

-- Populate user_division dari join ke users table
UPDATE tickets t
JOIN users u ON t.id_user = u.id
SET t.user_division = u.division
WHERE t.user_division IS NULL;

-- Populate nlp_category dari category (jika ada)
UPDATE tickets
SET nlp_category = category
WHERE nlp_category IS NULL AND category IS NOT NULL;

-- Set default untuk nlp_category yang masih NULL
UPDATE tickets
SET nlp_category = 'General'
WHERE nlp_category IS NULL;

-- Create index untuk performa query (skip JSON index untuk MariaDB compatibility)
-- Note: MariaDB tidak support functional index, jadi skip index untuk target_divisions
-- CREATE INDEX idx_target_divisions ON tickets((CAST(target_divisions AS CHAR(255))));
CREATE INDEX IF NOT EXISTS idx_user_division ON tickets(user_division);
CREATE INDEX IF NOT EXISTS idx_nlp_category ON tickets(nlp_category);

-- Verify migration
SELECT 'Tickets with target_divisions:' as Info, COUNT(*) as Total
FROM tickets
WHERE target_divisions IS NOT NULL;

SELECT 'Tickets with user_division:' as Info, COUNT(*) as Total
FROM tickets
WHERE user_division IS NOT NULL;

SELECT 'Sample data after migration:' as Info;
SELECT
  id,
  title,
  old_target_division_backup,
  target_divisions,
  user_division,
  nlp_category
FROM tickets
LIMIT 5;
