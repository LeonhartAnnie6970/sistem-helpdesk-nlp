-- ============================================================
-- Migration: Fitur Approval Tiket Lintas Divisi
-- File: add-ticket-approval.sql
--
-- Tiket yang dibuat user dan ditujukan ke divisi LAIN (selain
-- divisinya sendiri) harus disetujui dulu oleh admin divisi asal
-- sebelum diteruskan/terlihat oleh admin & user divisi tujuan.
--
-- CARA MENJALANKAN:
-- Jalankan script ini di database sistem_helpdesk_nlp yang sudah ada.
-- ============================================================

USE sistem_helpdesk_nlp;

-- Kolom approval pada tabel tickets
ALTER TABLE tickets
  ADD COLUMN approval_status ENUM('not_required', 'pending', 'approved', 'rejected') DEFAULT 'not_required' AFTER status,
  ADD COLUMN approved_by INT DEFAULT NULL AFTER approval_status,
  ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL AFTER approved_by,
  ADD COLUMN rejection_reason TEXT DEFAULT NULL AFTER approved_at,
  ADD CONSTRAINT fk_tickets_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD INDEX idx_approval_status (approval_status);

-- Tiket lama yang sudah ada dianggap tidak perlu approval (grandfathered)
UPDATE tickets SET approval_status = 'not_required' WHERE approval_status IS NULL;

-- Tambah reason baru untuk notifikasi admin (permintaan approval)
ALTER TABLE notifications
  MODIFY COLUMN notification_reason ENUM('user_division', 'nlp_category', 'super_admin', 'approval_pending') DEFAULT NULL;

-- Tambah tipe notifikasi baru untuk user (hasil approval)
ALTER TABLE user_notifications
  MODIFY COLUMN type ENUM('status_update', 'admin_note', 'admin_image', 'ticket_resolved', 'new_ticket', 'ticket_approved', 'ticket_rejected') DEFAULT 'status_update';

SELECT 'MIGRATION add-ticket-approval.sql SELESAI!' AS status;
