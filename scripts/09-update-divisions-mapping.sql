-- TAHAP 9: UPDATE DIVISIONS & NLP CATEGORY MAPPING
-- File: scripts/09-update-divisions-mapping.sql
-- Deskripsi: Update divisi baru dan mapping kategori NLP

USE helpdesk_nlp;

-- Drop table mapping lama jika ada
DROP TABLE IF EXISTS category_division_mapping;

-- Create table untuk mapping NLP category ke division
CREATE TABLE IF NOT EXISTS category_division_mapping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nlp_category VARCHAR(100) NOT NULL COMMENT 'Kategori hasil NLP',
  target_division VARCHAR(100) NOT NULL COMMENT 'Divisi tujuan',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Status aktif mapping',
  priority INT DEFAULT 1 COMMENT 'Prioritas routing (1=highest)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_mapping (nlp_category, target_division)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert mapping untuk kategori NLP ke divisi baru
-- IT: Semua masalah teknis, jaringan, hardware, software, akun
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
('IT', 'IT', 1);

-- ACC/FINANCE: Keuangan, pembayaran, invoice
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
('ACC/FINANCE', 'ACC/FINANCE', 1);

-- OPERASIONAL: Logistik, operasi, produksi
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
('OPERASIONAL', 'OPERASIONAL', 1);

-- SALES: Penjualan, marketing, promosi
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
('SALES', 'SALES', 1);

-- CUSTOMER SERVICE: Layanan pelanggan, komplain
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
('CUSTOMER SERVICE', 'CUSTOMER SERVICE', 1);

-- HR: SDM, karyawan, cuti, gaji
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
('HR', 'HR', 1);

-- DIREKSI/DIREKTUR: Strategi, keputusan eksekutif
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
('DIREKSI/DIREKTUR', 'DIREKSI/DIREKTUR', 1);

-- Update existing tickets target_division to new divisions (if needed)
-- Backup old division values first
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS old_target_division VARCHAR(100);
UPDATE tickets SET old_target_division = target_division WHERE old_target_division IS NULL;

-- Update target_division dengan default IT untuk existing data
UPDATE tickets SET target_division = 'IT' WHERE target_division IS NULL OR target_division = '';

-- Create index untuk performa
CREATE INDEX idx_category_mapping ON category_division_mapping(nlp_category);
CREATE INDEX idx_division_mapping ON category_division_mapping(target_division);

-- Update users table - update existing divisions ke divisi baru
-- Hati-hati: Sesuaikan mapping ini dengan data existing Anda
UPDATE users SET division = 'IT' WHERE division IN ('IT & Teknologi', 'IT', 'Information Technology');
UPDATE users SET division = 'ACC/FINANCE' WHERE division IN ('Finance & Accounting', 'Finance', 'Accounting', 'ACC', 'FINANCE');
UPDATE users SET division = 'OPERASIONAL' WHERE division IN ('Operations', 'Operational', 'Logistics & Supply Chain', 'Quality Assurance');
UPDATE users SET division = 'SALES' WHERE division IN ('Sales & Marketing', 'Sales', 'Marketing');
UPDATE users SET division = 'CUSTOMER SERVICE' WHERE division IN ('Customer Service', 'CS');
UPDATE users SET division = 'HR' WHERE division IN ('Human Resources', 'HR', 'HRD');
UPDATE users SET division = 'DIREKSI/DIREKTUR' WHERE division IN ('Admin & General', 'Management', 'Executive', 'Research & Development');

-- Verify data
SELECT 'Category Mapping Count:' as Info, COUNT(*) as Total FROM category_division_mapping;
SELECT 'Divisions in Users:' as Info, division, COUNT(*) as Total FROM users GROUP BY division;
SELECT 'Divisions in Tickets:' as Info, target_division, COUNT(*) as Total FROM tickets GROUP BY target_division;
