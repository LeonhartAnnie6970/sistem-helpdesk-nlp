-- ============================================================
-- Migration: Fitur Urgensi & Deadline (SLA) Tiket (versi PRODUCTION / TiDB Cloud)
-- File: add-ticket-urgency-production.sql
--
-- Sama seperti add-ticket-urgency.sql, tapi dipecah per langkah
-- (lebih kompatibel dengan TiDB, gampang di-retry kalau ada yang gagal).
-- Semua langkah ADDITIVE - aman dijalankan saat aplikasi live.
-- ============================================================

-- Langkah 1: kolom urgency
ALTER TABLE tickets
  ADD COLUMN urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' AFTER nlp_keywords;

-- Langkah 2: kolom deadline_at
ALTER TABLE tickets
  ADD COLUMN deadline_at TIMESTAMP NULL DEFAULT NULL AFTER urgency;

-- Langkah 3: index urgency
ALTER TABLE tickets
  ADD INDEX idx_urgency (urgency);

-- Langkah 4: index deadline_at
ALTER TABLE tickets
  ADD INDEX idx_deadline_at (deadline_at);

-- Langkah 5: tiket lama dianggap urgensi sedang
UPDATE tickets
SET urgency = 'medium'
WHERE urgency IS NULL;

-- Langkah 6: backfill deadline_at untuk tiket lama yang masih aktif (SLA sedang = 72 jam)
UPDATE tickets
SET deadline_at = DATE_ADD(created_at, INTERVAL 72 HOUR)
WHERE deadline_at IS NULL
  AND approval_status IN ('not_required', 'approved')
  AND status NOT IN ('resolved', 'closed');

-- Verifikasi
SELECT 'MIGRATION add-ticket-urgency-production.sql SELESAI!' AS status;
DESCRIBE tickets;
