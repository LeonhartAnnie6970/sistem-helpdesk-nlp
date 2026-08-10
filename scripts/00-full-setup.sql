-- ============================================================
-- SISTEM HELPDESK NLP SJPL - FULL DATABASE SETUP
-- File: 00-full-setup.sql
-- Deskripsi: Script lengkap untuk setup database dari awal
--
-- CARA MENJALANKAN:
-- 1. Buka XAMPP, start MySQL
-- 2. Buka phpMyAdmin atau MySQL CLI
-- 3. Copy-paste seluruh script ini dan execute
-- ============================================================

-- Drop database jika ada (HATI-HATI: akan menghapus semua data!)
DROP DATABASE IF EXISTS sistem_helpdesk_nlp;

-- Buat database baru
CREATE DATABASE sistem_helpdesk_nlp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistem_helpdesk_nlp;

-- ============================================================
-- TABEL 1: USERS
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'user') DEFAULT 'user',
    division VARCHAR(100) DEFAULT NULL,
    notification_email VARCHAR(100) DEFAULT NULL,
    profile_image_url VARCHAR(500) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,

    INDEX idx_role (role),
    INDEX idx_division (division),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 2: TICKETS
-- ============================================================
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',

    approval_status ENUM('not_required', 'pending', 'approved', 'rejected') DEFAULT 'not_required',
    approved_by INT DEFAULT NULL,
    approved_at TIMESTAMP NULL DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,

    image_user_url VARCHAR(500) DEFAULT NULL,
    image_admin_url VARCHAR(500) DEFAULT NULL,
    image_admin_uploaded_at TIMESTAMP NULL DEFAULT NULL,

    admin_notes TEXT DEFAULT NULL,

    user_division VARCHAR(100) DEFAULT NULL,
    target_divisions JSON DEFAULT NULL,

    nlp_category VARCHAR(100) DEFAULT NULL,
    nlp_confidence DECIMAL(5,2) DEFAULT 0.00,
    nlp_keywords TEXT DEFAULT NULL,

    urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    deadline_at TIMESTAMP NULL DEFAULT NULL,

    is_nlp_overridden BOOLEAN DEFAULT FALSE,
    original_nlp_division VARCHAR(100) DEFAULT NULL,
    override_reason TEXT DEFAULT NULL,
    overridden_by INT DEFAULT NULL,
    overridden_at TIMESTAMP NULL DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (overridden_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_status (status),
    INDEX idx_approval_status (approval_status),
    INDEX idx_urgency (urgency),
    INDEX idx_deadline_at (deadline_at),
    INDEX idx_user_division (user_division),
    INDEX idx_nlp_category (nlp_category),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_id_user (id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 3: NOTIFICATIONS (untuk Admin)
-- ============================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL,
    id_ticket INT NOT NULL,
    id_user INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_reason ENUM('user_division', 'nlp_category', 'super_admin', 'approval_pending') DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_admin) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_admin_read (id_admin, is_read),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 4: USER_NOTIFICATIONS (untuk User biasa)
-- ============================================================
CREATE TABLE user_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_ticket INT NOT NULL,
    ticket_title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('status_update', 'admin_note', 'admin_image', 'ticket_resolved', 'new_ticket', 'ticket_approved', 'ticket_rejected') DEFAULT 'status_update',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,

    INDEX idx_user_read (id_user, is_read),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 5: SUPER_ADMIN_NOTIFICATIONS
-- ============================================================
CREATE TABLE super_admin_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_super_admin INT NOT NULL,
    id_ticket INT NOT NULL,
    id_user INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_super_admin) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_super_admin_read (id_super_admin, is_read),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 6: CATEGORY_DIVISION_MAPPING
-- ============================================================
CREATE TABLE category_division_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nlp_category VARCHAR(100) NOT NULL,
    target_division VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_mapping (nlp_category, target_division),
    INDEX idx_category (nlp_category),
    INDEX idx_division (target_division)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 7: TICKET_COMMENTS
-- ============================================================
CREATE TABLE ticket_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    comment_type ENUM('comment', 'status_change', 'response') DEFAULT 'comment',
    old_status VARCHAR(50) DEFAULT NULL,
    new_status VARCHAR(50) DEFAULT NULL,
    attachment_path VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_ticket_id (ticket_id),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATA USERS
-- Password: admin123
-- Hash ini di-generate menggunakan bcrypt dengan salt 10
-- ============================================================

-- Super Admin
INSERT INTO users (name, email, password, role, division, is_active) VALUES
('Super Admin', 'superadmin@helpdesk.com', '$2a$10$placeholder', 'super_admin', 'IT', TRUE),
('Direktur Utama', 'direktur@helpdesk.com', '$2a$10$placeholder', 'super_admin', 'DIREKSI/DIREKTUR', TRUE);

-- Admin per Divisi
INSERT INTO users (name, email, password, role, division, is_active) VALUES
('Admin IT', 'admin.it@helpdesk.com', '$2a$10$placeholder', 'admin', 'IT', TRUE),
('Admin Finance', 'admin.finance@helpdesk.com', '$2a$10$placeholder', 'admin', 'ACC/FINANCE', TRUE),
('Admin Operasional', 'admin.ops@helpdesk.com', '$2a$10$placeholder', 'admin', 'OPERASIONAL', TRUE),
('Admin Sales', 'admin.sales@helpdesk.com', '$2a$10$placeholder', 'admin', 'SALES', TRUE),
('Admin CS', 'admin.cs@helpdesk.com', '$2a$10$placeholder', 'admin', 'CUSTOMER SERVICE', TRUE),
('Admin HR', 'admin.hr@helpdesk.com', '$2a$10$placeholder', 'admin', 'HR', TRUE);

-- User Biasa
INSERT INTO users (name, email, password, role, division, is_active) VALUES
('John Doe', 'john@helpdesk.com', '$2a$10$placeholder', 'user', 'IT', TRUE),
('Rudi Hartono', 'rudi@helpdesk.com', '$2a$10$placeholder', 'user', 'ACC/FINANCE', TRUE),
('Sinta Wijaya', 'sinta@helpdesk.com', '$2a$10$placeholder', 'user', 'SALES', TRUE),
('Budi Santoso', 'budi@helpdesk.com', '$2a$10$placeholder', 'user', 'HR', TRUE),
('Dewi Lestari', 'dewi@helpdesk.com', '$2a$10$placeholder', 'user', 'OPERASIONAL', TRUE),
('Ahmad Fauzi', 'ahmad@helpdesk.com', '$2a$10$placeholder', 'user', 'CUSTOMER SERVICE', TRUE);

-- ============================================================
-- DATA CATEGORY-DIVISION MAPPING
-- ============================================================
INSERT INTO category_division_mapping (nlp_category, target_division, priority) VALUES
('IT', 'IT', 1),
('ACC/FINANCE', 'ACC/FINANCE', 1),
('OPERASIONAL', 'OPERASIONAL', 1),
('SALES', 'SALES', 1),
('CUSTOMER SERVICE', 'CUSTOMER SERVICE', 1),
('HR', 'HR', 1),
('DIREKSI/DIREKTUR', 'DIREKSI/DIREKTUR', 1),
('General', 'GENERAL', 1);

-- ============================================================
-- VERIFIKASI
-- ============================================================
SELECT 'DATABASE CREATED SUCCESSFULLY!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_mappings FROM category_division_mapping;

-- ============================================================
-- PENTING: Setelah menjalankan script ini, jalankan:
-- node scripts/03-setup-passwords.js
-- untuk mengupdate password dengan hash bcrypt yang valid
-- ============================================================
