CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_admin INT NOT NULL,
  id_ticket INT NOT NULL,
  id_user INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_admin) REFERENCES users(id),
  FOREIGN KEY (id_ticket) REFERENCES tickets(id),
  FOREIGN KEY (id_user) REFERENCES users(id)
);

CREATE INDEX idx_admin_read ON notifications(id_admin, is_read);
CREATE INDEX idx_created_at ON notifications(created_at DESC);


```sql
-- Tabel untuk notifikasi super_admin
CREATE TABLE IF NOT EXISTS super_admin_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_super_admin INT NOT NULL,
  id_ticket INT NOT NULL,
  id_user INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_super_admin) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_super_admin_read (id_super_admin, is_read),
  INDEX idx_created_at (created_at)
);

-- Tabel untuk notifikasi user
CREATE TABLE IF NOT EXISTS user_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  id_ticket INT NOT NULL,
  ticket_title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('status_update', 'admin_note', 'admin_image', 'ticket_resolved') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
  INDEX idx_user_read (id_user, is_read),
  INDEX idx_created_at (created_at)
);