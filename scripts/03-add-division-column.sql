-- Add division column to users table
ALTER TABLE users ADD COLUMN divisi VARCHAR(100) DEFAULT NULL AFTER email;

-- Add index for better query performance
ALTER TABLE users ADD INDEX idx_divisi (divisi);
