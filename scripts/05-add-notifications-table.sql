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
