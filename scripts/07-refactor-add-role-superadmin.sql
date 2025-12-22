-- TAHAP 1: REFACTOR DATABASE - TAMBAH SUPER ADMIN ROLE
-- File: scripts/07-refactor-add-role-superadmin.sql
-- Deskripsi: Menambah role super_admin dan memperbaiki struktur role

USE helpdesk_nlp;

-- Ubah kolom role untuk support super_admin
ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'user') DEFAULT 'user';

-- Update admin existing menjadi super_admin untuk IT dan Direksi
-- Sesuaikan dengan email admin Anda
UPDATE users SET role = 'super_admin' WHERE email = 'admin@helpdesk.com';

-- Contoh: Tambah user super admin baru (IT & DIREKSI)
INSERT INTO users (name, email, password, role, divisi) VALUES
('Super Admin IT', 'superadmin@company.com', '$2b$10$YourHashedPasswordHere', 'super_admin', 'IT & Teknologi'),
('Direktur Utama', 'direktur@company.com', '$2b$10$YourHashedPasswordHere', 'super_admin', 'DIREKSI')
ON DUPLICATE KEY UPDATE role = 'super_admin';

-- Contoh: Tambah admin per divisi (Head/Manager)
INSERT INTO users (name, email, password, role, divisi) VALUES
('Head IT', 'head.it@company.com', '$2b$10$YourHashedPasswordHere', 'admin', 'IT & Teknologi'),
('Head Finance', 'head.finance@company.com', '$2b$10$YourHashedPasswordHere', 'admin', 'ACC / FINANCE'),
('Head Operations', 'head.ops@company.com', '$2b$10$YourHashedPasswordHere', 'admin', 'OPERASIONAL'),
('Head Sales', 'head.sales@company.com', '$2b$10$YourHashedPasswordHere', 'admin', 'SALES'),
('Head Customer Service', 'head.cs@company.com', '$2b$10$YourHashedPasswordHere', 'admin', 'CUSTOMER SERVICE'),
('Head HR', 'head.hr@company.com', '$2b$10$YourHashedPasswordHere', 'admin', 'HR')
ON DUPLICATE KEY UPDATE role = 'admin';
