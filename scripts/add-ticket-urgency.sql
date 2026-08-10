-- ============================================================
-- Migration: Fitur Urgensi & Deadline (SLA) Tiket
-- File: add-ticket-urgency.sql
--
-- Menambahkan tingkat urgensi (low/medium/high/critical) dan
-- deadline_at (batas waktu proses berdasarkan SLA urgensi) ke tiket.
-- deadline_at kosong selama tiket masih 'pending' approval - baru
-- diisi saat tiket disetujui atau saat dibuat (kalau tidak perlu approval).
--
-- CARA MENJALANKAN (dev/lokal):
-- Jalankan script ini di database sistem_helpdesk_nlp yang sudah ada.
-- Untuk production/TiDB Cloud, pakai add-ticket-urgency-production.sql.
-- ============================================================

USE sistem_helpdesk_nlp;

ALTER TABLE tickets
  ADD COLUMN urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' AFTER nlp_keywords,
  ADD COLUMN deadline_at TIMESTAMP NULL DEFAULT NULL AFTER urgency,
  ADD INDEX idx_urgency (urgency),
  ADD INDEX idx_deadline_at (deadline_at);

-- Tiket lama yang sudah ada: anggap urgensi sedang, deadline dihitung dari created_at + 3 hari
UPDATE tickets
SET urgency = 'medium'
WHERE urgency IS NULL;

UPDATE tickets
SET deadline_at = DATE_ADD(created_at, INTERVAL 72 HOUR)
WHERE deadline_at IS NULL
  AND approval_status IN ('not_required', 'approved')
  AND status NOT IN ('resolved', 'closed');

SELECT 'MIGRATION add-ticket-urgency.sql SELESAI!' AS status;
