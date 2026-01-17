-- ============================================================
-- SISTEM HELPDESK NLP SJPL - DATABASE SETUP
-- File: 01-create-database.sql
-- Deskripsi: Membuat database dan semua tabel yang dibutuhkan
-- ============================================================

-- Buat database
CREATE DATABASE IF NOT EXISTS sistem_helpdesk_nlp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistem_helpdesk_nlp;

-- ============================================================
-- TABEL 1: USERS
-- Menyimpan data pengguna dengan 3 role: super_admin, admin, user
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'user') DEFAULT 'user',
    division VARCHAR(100) DEFAULT NULL COMMENT 'Divisi user: IT, ACC/FINANCE, OPERASIONAL, SALES, CUSTOMER SERVICE, HR, DIREKSI/DIREKTUR',
    notification_email VARCHAR(100) DEFAULT NULL COMMENT 'Email alternatif untuk notifikasi',
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
-- Menyimpan tiket helpdesk dengan hasil klasifikasi NLP
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL COMMENT 'User yang membuat tiket',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT NULL COMMENT 'Kategori manual dari user',
    status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',

    -- Gambar lampiran
    image_user_url VARCHAR(500) DEFAULT NULL COMMENT 'Gambar dari user',
    image_admin_url VARCHAR(500) DEFAULT NULL COMMENT 'Gambar response dari admin',
    image_admin_uploaded_at TIMESTAMP NULL DEFAULT NULL,

    -- Catatan admin
    admin_notes TEXT DEFAULT NULL,

    -- Divisi routing
    user_division VARCHAR(100) DEFAULT NULL COMMENT 'Divisi pembuat tiket',
    target_divisions JSON DEFAULT NULL COMMENT 'Array divisi tujuan tiket',

    -- Hasil NLP
    nlp_category VARCHAR(100) DEFAULT NULL COMMENT 'Kategori hasil NLP',
    nlp_confidence DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Confidence level 0-100',
    nlp_keywords TEXT DEFAULT NULL COMMENT 'Keywords yang terdeteksi (JSON)',

    -- Override NLP
    is_nlp_overridden BOOLEAN DEFAULT FALSE,
    original_nlp_division VARCHAR(100) DEFAULT NULL COMMENT 'Divisi asli sebelum override',
    override_reason TEXT DEFAULT NULL,
    overridden_by INT DEFAULT NULL,
    overridden_at TIMESTAMP NULL DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (overridden_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_status (status),
    INDEX idx_user_division (user_division),
    INDEX idx_nlp_category (nlp_category),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_id_user (id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 3: NOTIFICATIONS (untuk Admin)
-- Notifikasi tiket baru untuk admin berdasarkan divisi
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL COMMENT 'Admin penerima notifikasi',
    id_ticket INT NOT NULL,
    id_user INT NOT NULL COMMENT 'User pembuat tiket',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_reason ENUM('user_division', 'nlp_category', 'super_admin') DEFAULT NULL,
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
-- Notifikasi update tiket untuk user
-- ============================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_ticket INT NOT NULL,
    ticket_title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('status_update', 'admin_note', 'admin_image', 'ticket_resolved', 'new_ticket') DEFAULT 'status_update',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,

    INDEX idx_user_read (id_user, is_read),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 5: SUPER_ADMIN_NOTIFICATIONS
-- Notifikasi khusus untuk Super Admin (semua tiket)
-- ============================================================
CREATE TABLE IF NOT EXISTS super_admin_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_super_admin INT NOT NULL,
    id_ticket INT NOT NULL,
    id_user INT NOT NULL COMMENT 'User pembuat tiket',
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
-- Mapping kategori NLP ke divisi tujuan
-- ============================================================
CREATE TABLE IF NOT EXISTS category_division_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nlp_category VARCHAR(100) NOT NULL,
    target_division VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 1 COMMENT 'Prioritas routing (1 = tertinggi)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_mapping (nlp_category, target_division),
    INDEX idx_category (nlp_category),
    INDEX idx_division (target_division)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL 7: TICKET_COMMENTS
-- Komentar dan history perubahan tiket
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_comments (
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
