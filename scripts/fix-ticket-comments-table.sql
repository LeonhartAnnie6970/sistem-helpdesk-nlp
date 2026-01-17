-- =====================================================
-- Fix ticket_comments table - add missing columns
-- =====================================================

USE sistem_helpdesk_nlp;

-- Add comment_type column
ALTER TABLE ticket_comments
ADD COLUMN comment_type ENUM('comment', 'status_change', 'response') DEFAULT 'comment'
AFTER comment;

-- Add old_status column if not exists
ALTER TABLE ticket_comments
ADD COLUMN old_status VARCHAR(50) DEFAULT NULL
AFTER comment_type;

-- Add new_status column if not exists
ALTER TABLE ticket_comments
ADD COLUMN new_status VARCHAR(50) DEFAULT NULL
AFTER old_status;

-- Add attachment_path column if not exists
ALTER TABLE ticket_comments
ADD COLUMN attachment_path VARCHAR(500) DEFAULT NULL
AFTER new_status;

-- Verify the changes
DESCRIBE ticket_comments;
