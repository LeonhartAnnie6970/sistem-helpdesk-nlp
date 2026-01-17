-- =====================================================
-- Update Category-Division Mapping
-- Sesuai dengan classifier.py categories
-- Run this SQL to update existing database
-- =====================================================

USE sistem_helpdesk_nlp;

-- Hapus mapping lama yang tidak sesuai
DELETE FROM category_division_mapping;

-- Insert mapping baru sesuai kategori NLP dari classifier.py
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
-- IT (kategori utama dari NLP)
('IT', 'IT', 1),

-- ACC/FINANCE (kategori utama dari NLP)
('ACC/FINANCE', 'ACC/FINANCE', 1),

-- OPERASIONAL (kategori utama dari NLP)
('OPERASIONAL', 'OPERASIONAL', 1),

-- SALES (kategori utama dari NLP)
('SALES', 'SALES', 1),

-- CUSTOMER SERVICE (kategori utama dari NLP)
('CUSTOMER SERVICE', 'CUSTOMER SERVICE', 1),

-- HR (kategori utama dari NLP)
('HR', 'HR', 1),

-- DIREKSI/DIREKTUR (kategori utama dari NLP)
('DIREKSI/DIREKTUR', 'DIREKSI/DIREKTUR', 1),

-- General (fallback kategori dari NLP)
('General', 'GENERAL', 1);

-- Verifikasi mapping
SELECT * FROM category_division_mapping ORDER BY nlp_category;
