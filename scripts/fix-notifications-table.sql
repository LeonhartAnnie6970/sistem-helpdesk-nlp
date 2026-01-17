-- =====================================================
-- Fix notifications table - add notification_reason column
-- =====================================================

USE sistem_helpdesk_nlp;

-- Add notification_reason column to notifications table
ALTER TABLE notifications
ADD COLUMN notification_reason ENUM('user_division', 'nlp_category', 'super_admin') DEFAULT NULL
AFTER message;

-- Verify the change
DESCRIBE notifications;
