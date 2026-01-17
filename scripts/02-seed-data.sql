-- ============================================================
-- SISTEM HELPDESK NLP SJPL - SEED DATA
-- File: 02-seed-data.sql
-- Deskripsi: Data awal untuk testing dan development
-- ============================================================

USE sistem_helpdesk_nlp;

-- ============================================================
-- DATA USERS
-- Password untuk semua user: admin123
-- Hash: $2a$10$8K1p/W0xJXQZKJ1p/W0xJXQZKJ1p/W0xJXQZKJ1p/W0xJXQZK
-- PENTING: Jalankan script Node.js untuk generate password yang benar!
-- ============================================================

-- Super Admin (Bisa lihat semua tiket, manage semua user)
INSERT INTO users (name, email, password, role, division, is_active) VALUES
('Super Admin', 'superadmin@helpdesk.com', '$HASH_PASSWORD$', 'super_admin', 'IT', TRUE),
('Direktur Utama', 'direktur@helpdesk.com', '$HASH_PASSWORD$', 'super_admin', 'DIREKSI/DIREKTUR', TRUE);

-- Admin per Divisi (Bisa lihat tiket divisinya, manage user divisinya)
INSERT INTO users (name, email, password, role, division, is_active) VALUES
('Admin IT', 'admin.it@helpdesk.com', '$HASH_PASSWORD$', 'admin', 'IT', TRUE),
('Admin Finance', 'admin.finance@helpdesk.com', '$HASH_PASSWORD$', 'admin', 'ACC/FINANCE', TRUE),
('Admin Operasional', 'admin.ops@helpdesk.com', '$HASH_PASSWORD$', 'admin', 'OPERASIONAL', TRUE),
('Admin Sales', 'admin.sales@helpdesk.com', '$HASH_PASSWORD$', 'admin', 'SALES', TRUE),
('Admin CS', 'admin.cs@helpdesk.com', '$HASH_PASSWORD$', 'admin', 'CUSTOMER SERVICE', TRUE),
('Admin HR', 'admin.hr@helpdesk.com', '$HASH_PASSWORD$', 'admin', 'HR', TRUE);

-- User Biasa (Bisa buat tiket, lihat tiket sendiri)
INSERT INTO users (name, email, password, role, division, is_active) VALUES
('John Doe', 'john@helpdesk.com', '$HASH_PASSWORD$', 'user', 'IT', TRUE),
('Rudi Hartono', 'rudi@helpdesk.com', '$HASH_PASSWORD$', 'user', 'ACC/FINANCE', TRUE),
('Sinta Wijaya', 'sinta@helpdesk.com', '$HASH_PASSWORD$', 'user', 'SALES', TRUE),
('Budi Santoso', 'budi@helpdesk.com', '$HASH_PASSWORD$', 'user', 'HR', TRUE),
('Dewi Lestari', 'dewi@helpdesk.com', '$HASH_PASSWORD$', 'user', 'OPERASIONAL', TRUE),
('Ahmad Fauzi', 'ahmad@helpdesk.com', '$HASH_PASSWORD$', 'user', 'CUSTOMER SERVICE', TRUE);

-- ============================================================
-- DATA CATEGORY-DIVISION MAPPING
-- Mapping kategori NLP ke divisi tujuan
-- ============================================================
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
-- =====================================================
-- MAPPING UTAMA: Kategori NLP -> Divisi Tujuan
-- Sesuai dengan classifier.py categories
-- =====================================================

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

-- ============================================================
-- DATA SAMPLE TICKETS
-- Contoh tiket untuk testing
-- ============================================================
INSERT INTO tickets (id_user, title, description, user_division, nlp_category, target_divisions, nlp_confidence, status) VALUES
-- Tiket dari user IT
(9, 'Wifi kantor lantai 3 lemot', 'Internet kantor sangat lambat sejak kemarin, tidak bisa browsing dan video call terputus-putus', 'IT', 'Network', '["IT"]', 92.50, 'new'),

-- Tiket dari user Finance
(10, 'Tidak bisa akses sistem ERP', 'Tidak bisa login ke sistem ERP, muncul error "Connection Refused"', 'ACC/FINANCE', 'Software', '["IT", "ACC/FINANCE"]', 87.30, 'in_progress'),

-- Tiket dari user Sales
(11, 'Request laptop baru', 'Laptop saat ini sudah lambat, butuh upgrade untuk presentasi ke client', 'SALES', 'Hardware', '["IT"]', 95.10, 'new'),

-- Tiket dari user HR
(12, 'Error di sistem absensi', 'Sistem absensi tidak merekam check-in pagi ini untuk beberapa karyawan', 'HR', 'Software', '["IT", "HR"]', 78.40, 'new'),

-- Tiket dari user Operasional
(13, 'Printer gudang rusak', 'Printer untuk cetak label pengiriman tidak bisa print, paper jam terus', 'OPERASIONAL', 'Hardware', '["IT", "OPERASIONAL"]', 89.20, 'resolved'),

-- Tiket dari user CS
(14, 'Aplikasi CRM crash', 'Aplikasi CRM sering crash saat buka data customer, sudah restart tetap sama', 'CUSTOMER SERVICE', 'Software', '["IT", "CUSTOMER SERVICE"]', 91.00, 'in_progress');
