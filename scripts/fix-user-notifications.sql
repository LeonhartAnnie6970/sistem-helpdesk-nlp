-- =====================================================
-- Fix user_notifications table structure
-- Run this SQL to ensure the table has correct structure
-- =====================================================

USE sistem_helpdesk_nlp;

-- Check current table structure
DESCRIBE user_notifications;

-- Update type ENUM to include all notification types (MariaDB syntax)
ALTER TABLE user_notifications
MODIFY type ENUM('status_update', 'admin_note', 'admin_image', 'ticket_resolved', 'new_ticket') DEFAULT 'status_update';

-- Verify the change
DESCRIBE user_notifications;

-- Show all existing notifications
SELECT * FROM user_notifications ORDER BY created_at DESC LIMIT 20;

-- Count notifications per user
SELECT id_user, COUNT(*) as notification_count
FROM user_notifications
GROUP BY id_user;
