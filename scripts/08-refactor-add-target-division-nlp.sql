-- TAHAP 1: REFACTOR DATABASE - TAMBAH TARGET DIVISION & NLP FIELDS
-- File: scripts/08-refactor-add-target-division-nlp.sql
-- Deskripsi: Menambah kolom untuk hasil klasifikasi NLP dan target divisi

USE helpdesk_nlp;

-- Tambah kolom target_division untuk hasil klasifikasi NLP
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS target_division VARCHAR(100) COMMENT 'Divisi tujuan hasil klasifikasi NLP';

-- Tambah kolom confidence untuk confidence level NLP (0-100)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS nlp_confidence DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Confidence level NLP dalam persen';

-- Tambah kolom dominant_keywords untuk keyword dominan hasil NLP
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS nlp_keywords TEXT COMMENT 'Keyword dominan hasil analisis NLP (JSON array)';

-- Tambah kolom is_overridden untuk tracking override hasil NLP
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_nlp_overridden BOOLEAN DEFAULT FALSE COMMENT 'Apakah hasil NLP sudah di-override manual';

-- Tambah kolom original_target untuk simpan hasil NLP asli sebelum override
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS original_nlp_division VARCHAR(100) COMMENT 'Divisi hasil NLP asli sebelum override';

-- Update existing tickets dengan default target_division dari category
UPDATE tickets SET target_division = 'IT & Teknologi' WHERE target_division IS NULL OR target_division = '';

-- Index untuk performa query
CREATE INDEX idx_target_division ON tickets(target_division);
CREATE INDEX idx_nlp_overridden ON tickets(is_nlp_overridden);
