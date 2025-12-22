-- Migration untuk menambah kolom gambar di tabel tickets
ALTER TABLE tickets ADD COLUMN image_user_url VARCHAR(500) AFTER description;
ALTER TABLE tickets ADD COLUMN image_admin_url VARCHAR(500) AFTER image_user_url;
ALTER TABLE tickets ADD COLUMN image_admin_uploaded_at TIMESTAMP NULL AFTER image_admin_url;

-- Tambahkan index untuk query yang lebih cepat
CREATE INDEX idx_tickets_image_user ON tickets(image_user_url);
CREATE INDEX idx_tickets_image_admin ON tickets(image_admin_url);
