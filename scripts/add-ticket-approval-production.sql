-- ============================================================
-- Migration: Fitur Approval Tiket Lintas Divisi (versi PRODUCTION / TiDB Cloud)
-- File: add-ticket-approval-production.sql
--
-- Sama persis dengan add-ticket-approval.sql, tapi setiap perubahan
-- dipecah jadi statement terpisah supaya:
-- 1. Lebih kompatibel dengan TiDB (menghindari multi-schema-change
--    dalam satu ALTER TABLE yang kadang tidak didukung).
-- 2. Kalau ada satu langkah gagal, gampang tahu langkah mana dan bisa
--    dijalankan ulang tanpa mengulang langkah yang sudah sukses.
--
-- SEMUA langkah di sini bersifat ADDITIVE (ADD COLUMN / ADD INDEX /
-- MODIFY ENUM menambah opsi baru) - tidak ada DROP/DELETE, tidak
-- menyentuh data yang sudah ada, aman dijalankan saat aplikasi live.
-- ============================================================

-- Langkah 1: kolom approval_status
ALTER TABLE tickets
  ADD COLUMN approval_status ENUM('not_required', 'pending', 'approved', 'rejected') DEFAULT 'not_required' AFTER status;

-- Langkah 2: kolom approved_by
ALTER TABLE tickets
  ADD COLUMN approved_by INT DEFAULT NULL AFTER approval_status;

-- Langkah 3: kolom approved_at
ALTER TABLE tickets
  ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Langkah 4: kolom rejection_reason
ALTER TABLE tickets
  ADD COLUMN rejection_reason TEXT DEFAULT NULL AFTER approved_at;

-- Langkah 5: foreign key approved_by -> users(id)
ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Langkah 6: index untuk query approval_status
ALTER TABLE tickets
  ADD INDEX idx_approval_status (approval_status);

-- Langkah 7: tiket lama dianggap tidak perlu approval (grandfathered)
UPDATE tickets SET approval_status = 'not_required' WHERE approval_status IS NULL;

-- Langkah 8: tambah reason baru untuk notifikasi admin (permintaan approval)
ALTER TABLE notifications
  MODIFY COLUMN notification_reason ENUM('user_division', 'nlp_category', 'super_admin', 'approval_pending') DEFAULT NULL;

-- Langkah 9: tambah tipe notifikasi baru untuk user (hasil approval)
ALTER TABLE user_notifications
  MODIFY COLUMN type ENUM('status_update', 'admin_note', 'admin_image', 'ticket_resolved', 'new_ticket', 'ticket_approved', 'ticket_rejected') DEFAULT 'status_update';

-- Verifikasi
SELECT 'MIGRATION add-ticket-approval-production.sql SELESAI!' AS status;
DESCRIBE tickets;
