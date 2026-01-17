-- =====================================================
-- Update user_notifications table to add new_ticket type
-- Run this SQL to update existing database (MariaDB compatible)
-- =====================================================

USE sistem_helpdesk_nlp;

-- Add new_ticket type to user_notifications (MariaDB syntax)
ALTER TABLE user_notifications
MODIFY type ENUM('status_update', 'admin_note', 'admin_image', 'ticket_resolved', 'new_ticket') DEFAULT 'status_update';

-- Verify the change
DESCRIBE user_notifications;
