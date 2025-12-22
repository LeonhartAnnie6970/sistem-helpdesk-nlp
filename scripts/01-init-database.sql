-- Create database
CREATE DATABASE IF NOT EXISTS sistem_helpdesk_nlp;
USE sistem_helpdesk_nlp;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert dummy data
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@helpdesk.com', '$2b$10$YourHashedPasswordHere', 'admin'),
('John Doe', 'john@example.com', '$2b$10$YourHashedPasswordHere', 'user'),
('Rudi Hartono', 'rudi@example.com', '$2b$10$YourHashedPasswordHere', 'user'),
('Sinta Wijaya', 'sinta@example.com', '$2b$10$YourHashedPasswordHere', 'user');

INSERT INTO tickets (id_user, title, description, category, status) VALUES
(2, 'Wifi kantor lemot', 'Internet kantor sangat lambat, tidak bisa browsing', 'Network', 'new'),
(3, 'Tidak bisa login HR', 'Tidak bisa login ke sistem HR, password sudah benar', 'Account', 'in_progress'),
(4, 'Printer mati total', 'Printer lantai tiga rusak dan tidak bisa digunakan', 'Hardware', 'resolved'),
(2, 'Aplikasi crash', 'App keuangan error saat membuka laporan', 'Software', 'new'),
(3, 'Folder keuangan terkunci', 'Tidak punya akses folder keuangan di server', 'Access', 'new');
