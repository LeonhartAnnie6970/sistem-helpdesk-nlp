ALTER TABLE users ADD COLUMN notification_email VARCHAR(100) AFTER email;
ALTER TABLE users ADD INDEX idx_notification_email (notification_email);

-- Update existing admins with their email as notification email
UPDATE users SET notification_email = email WHERE role = 'admin';
