-- Migration: Add 'closed' to tickets status ENUM
ALTER TABLE tickets MODIFY COLUMN status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new';
