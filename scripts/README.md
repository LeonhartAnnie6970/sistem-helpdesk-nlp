# Database Setup - Sistem Helpdesk NLP SJPL

## Struktur Database

### Tabel yang Dibuat

| No | Tabel | Deskripsi |
|----|-------|-----------|
| 1 | `users` | Data pengguna (Super Admin, Admin, User) |
| 2 | `tickets` | Tiket helpdesk dengan hasil klasifikasi NLP |
| 3 | `notifications` | Notifikasi untuk Admin |
| 4 | `user_notifications` | Notifikasi untuk User |
| 5 | `super_admin_notifications` | Notifikasi untuk Super Admin |
| 6 | `category_division_mapping` | Mapping kategori NLP ke divisi |
| 7 | `ticket_comments` | Komentar dan history tiket |

### Role Pengguna

| Role | Akses |
|------|-------|
| `super_admin` | Lihat semua tiket, manage semua user, lihat statistik |
| `admin` | Lihat tiket divisinya, update status tiket, manage user divisinya |
| `user` | Buat tiket, lihat tiket sendiri, tambah komentar |

### Divisi yang Tersedia

1. IT
2. ACC/FINANCE
3. OPERASIONAL
4. SALES
5. CUSTOMER SERVICE
6. HR
7. DIREKSI/DIREKTUR

---

## Langkah-langkah Setup Database

### Prasyarat

- XAMPP dengan MySQL/MariaDB sudah terinstall
- Node.js sudah terinstall
- Project sudah di-clone dan `npm install` sudah dijalankan

### Step 1: Start MySQL

1. Buka **XAMPP Control Panel**
2. Klik **Start** pada MySQL
3. Tunggu sampai status menjadi hijau (Running)

### Step 2: Buat Database dan Tabel

**Opsi A: Via phpMyAdmin**
1. Buka browser, akses `http://localhost/phpmyadmin`
2. Klik tab **Import**
3. Pilih file `scripts/01-create-database.sql`
4. Klik **Go**

**Opsi B: Via Command Line**
```bash
cd c:\xampp\mysql\bin
mysql -u root < "path\to\project\scripts\01-create-database.sql"
```

### Step 3: Insert Data Awal

**Opsi A: Via phpMyAdmin**
1. Pilih database `sistem_helpdesk_nlp`
2. Klik tab **Import**
3. Pilih file `scripts/02-seed-data.sql`
4. Klik **Go**

**Opsi B: Via Command Line**
```bash
mysql -u root sistem_helpdesk_nlp < "path\to\project\scripts\02-seed-data.sql"
```

### Step 4: Setup Password

Jalankan script untuk generate password yang valid:

```bash
cd path\to\project
node scripts/03-setup-passwords.js
```

Script ini akan:
- Generate bcrypt hash untuk password `admin123`
- Update semua user dengan password yang valid
- Menampilkan daftar user yang bisa login

---

## Akun Login Default

Setelah setup, gunakan akun berikut untuk login:

**Password untuk semua akun: `admin123`**

### Super Admin
| Email | Divisi |
|-------|--------|
| superadmin@helpdesk.com | IT |
| direktur@helpdesk.com | DIREKSI/DIREKTUR |

### Admin
| Email | Divisi |
|-------|--------|
| admin.it@helpdesk.com | IT |
| admin.finance@helpdesk.com | ACC/FINANCE |
| admin.ops@helpdesk.com | OPERASIONAL |
| admin.sales@helpdesk.com | SALES |
| admin.cs@helpdesk.com | CUSTOMER SERVICE |
| admin.hr@helpdesk.com | HR |

### User
| Email | Divisi |
|-------|--------|
| john@helpdesk.com | IT |
| rudi@helpdesk.com | ACC/FINANCE |
| sinta@helpdesk.com | SALES |
| budi@helpdesk.com | HR |
| dewi@helpdesk.com | OPERASIONAL |
| ahmad@helpdesk.com | CUSTOMER SERVICE |

---

## Troubleshooting

### Error: ECONNREFUSED
MySQL tidak berjalan. Start MySQL di XAMPP Control Panel.

### Error: Table doesn't exist
Database belum dibuat. Jalankan `01-create-database.sql`.

### Error: Access denied
Cek username dan password MySQL di file `.env.local`.

### Password tidak valid
Jalankan ulang `node scripts/03-setup-passwords.js`.

---

## Reset Database

Jika ingin reset database dari awal:

```bash
# Via Command Line
mysql -u root -e "DROP DATABASE IF EXISTS sistem_helpdesk_nlp;"
mysql -u root < scripts/01-create-database.sql
mysql -u root sistem_helpdesk_nlp < scripts/02-seed-data.sql
node scripts/03-setup-passwords.js
```

Atau via phpMyAdmin:
1. Drop database `sistem_helpdesk_nlp`
2. Import ulang file SQL
3. Jalankan script password
