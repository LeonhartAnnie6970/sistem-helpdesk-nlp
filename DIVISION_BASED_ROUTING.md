# Sistem Routing Ticket Berdasarkan Divisi (NLP-Based)

## 📋 Overview

Sistem ini memungkinkan routing otomatis ticket berdasarkan hasil prediksi NLP ke divisi yang tepat. Hanya user/admin dari divisi yang dituju yang dapat melihat dan merespons ticket tersebut.

## 🎯 Cara Kerja

### 1. **Pembuatan Ticket dengan NLP**
```
User membuat ticket
    ↓
NLP menganalisis judul + deskripsi
    ↓
Sistem memprediksi kategori & target_division
    ↓
Ticket disimpan dengan target_division
    ↓
Notifikasi dikirim ke divisi tujuan
```

**Contoh:**
- User dari divisi **ACC/FINANCE** membuat ticket tentang "Printer rusak"
- NLP memprediksi: kategori = "Hardware", target_division = "IT"
- Ticket akan masuk ke divisi **IT**
- Semua user & admin di divisi **IT** bisa melihat dan merespons

### 2. **Access Control Matrix**

| Role | Dapat Melihat | Dapat Merespons | Dapat Ubah Status |
|------|--------------|----------------|------------------|
| **User** | - Ticket yang dibuat sendiri<br>- Ticket yang ditujukan ke divisinya<br>- Ticket yang dibuat oleh divisinya | Ya (untuk semua jenis) | Ya |
| **Admin** | - Ticket yang ditujukan ke divisinya<br>- Ticket yang dibuat dari divisinya | Ya | Ya |
| **Super Admin** | - Semua ticket | Ya | Ya |

### 3. **Ticket Visibility Rules**

#### User dari Divisi ACC/FINANCE membuat ticket → IT
```
✅ User pembuat (ACC/FINANCE) - Bisa lihat & respons
✅ Admin IT - Bisa lihat & respons
✅ User lain di IT - Bisa lihat & respons
✅ Admin ACC/FINANCE - Bisa lihat & respons
✅ User lain di ACC/FINANCE - Bisa lihat & respons
✅ Super Admin - Bisa lihat & respons
❌ Admin/User divisi lain (HR, SALES, dll) - TIDAK bisa lihat
```

## 🔧 Implementasi Teknis

### Database Schema

#### Tabel `tickets`
```sql
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_user INT,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  target_division VARCHAR(100),  -- Hasil prediksi NLP
  status ENUM('new', 'in_progress', 'resolved', 'closed'),
  nlp_confidence DECIMAL(5,2),
  created_at TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id)
);
```

#### Tabel `ticket_comments`
```sql
CREATE TABLE ticket_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT,
  user_id INT,
  comment TEXT,
  comment_type ENUM('comment', 'status_change', 'response'),
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  attachment_path VARCHAR(500),
  created_at TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### API Endpoints

#### 1. GET /api/tickets/by-target-division
Mengambil tickets berdasarkan target division dengan access control.

**Request:**
```http
GET /api/tickets/by-target-division
Authorization: Bearer {token}
```

**Response:**
```json
{
  "tickets": [
    {
      "id": 123,
      "title": "Printer rusak",
      "target_division": "IT",
      "user_name": "John Doe",
      "user_division": "ACC/FINANCE",
      "comment_count": 3,
      ...
    }
  ]
}
```

**Access Logic:**
- **User**: Return tickets:
  1. Created by user
  2. Targeted to user's division
  3. Created FROM user's division (by other users in same division)
- **Admin**: Return tickets:
  1. Targeted to admin's division
  2. Created FROM admin's division
- **Super Admin**: Return all tickets

#### 2. GET /api/tickets/[id]
Mengambil detail satu ticket dengan access control.

**Access Control:**
```typescript
if (role === "user") {
  allowed = ticket.id_user === userId ||
            ticket.target_division === userDivision ||
            ticket.user_division === userDivision  // From same division
}
else if (role === "admin") {
  allowed = ticket.target_division === adminDivision ||
            ticket.user_division === adminDivision  // From same division
}
else if (role === "super_admin") {
  allowed = true
}
```

#### 3. GET /api/tickets/[id]/comments
Mengambil semua komentar untuk ticket dengan access control yang sama.

#### 4. POST /api/tickets/[id]/comments
Menambahkan komentar/respons baru.

**Validasi:**
1. Check user has access to ticket
2. Validate user is from target division OR ticket creator
3. Insert comment with user info
4. Update ticket status if changed
5. Return comment with responder details

## 📱 Component Usage

### DivisionTicketList Component

Komponen untuk menampilkan tickets berdasarkan divisi:

```tsx
import { DivisionTicketList } from "@/components/division-ticket-list"

// Dalam dashboard
<DivisionTicketList refreshTrigger={refreshTrigger} />
```

**Features:**
- Auto-filter berdasarkan role & division
- Menampilkan badge "Dari: {division}" dan "Ke: {target_division}"
- Menampilkan jumlah respons
- Tombol "Lihat Detail & Tanggapi"

### TicketDetailModal Component

Modal untuk detail ticket dan form respons:

```tsx
<TicketDetailModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  ticketId={selectedId}
  onUpdate={() => fetchTickets()}
/>
```

**Features:**
- Menampilkan info pembuat ticket (nama, role, divisi)
- Riwayat lengkap semua respons dengan info responder
- Form untuk tambah respons
- Upload foto bukti
- Ubah status ticket
- Badge role untuk setiap responder

## 🚀 Setup & Migration

### 1. Run Database Migration

```bash
# Create ticket_comments table
mysql -u root -p sistem_helpdesk_nlp < scripts/10-add-ticket-comments.sql
```

### 2. Create Upload Directory

```bash
mkdir -p public/uploads/comments
chmod 755 public/uploads/comments
```

### 3. Verify Target Division Column Exists

```sql
USE sistem_helpdesk_nlp;
DESCRIBE tickets;
-- Pastikan kolom target_division ada
```

Jika belum ada, jalankan:
```bash
mysql -u root -p sistem_helpdesk_nlp < scripts/08-refactor-add-target-division-nlp.sql
```

## 📊 Contoh Skenario

### Skenario 1: User ACC/FINANCE Butuh Bantuan IT

1. **User (John - ACC/FINANCE)** membuat ticket:
   - Judul: "Laptop tidak bisa nyala"
   - Deskripsi: "Laptop saya tiba-tiba mati dan tidak bisa dihidupkan lagi"

2. **NLP Processing:**
   ```
   Analisis keyword: laptop, mati, tidak nyala
   Prediksi: category = "Hardware", target_division = "IT"
   ```

3. **Visibility:**
   - ✅ John (pembuat) - bisa lihat & respons
   - ✅ Admin IT (Budi) - bisa lihat & respons
   - ✅ User IT (Sarah, Ahmad) - bisa lihat & respons
   - ✅ Admin ACC/FINANCE - bisa lihat & respons
   - ✅ User lain ACC/FINANCE - bisa lihat & respons
   - ✅ Super Admin - bisa lihat & respons
   - ❌ Admin/User divisi lain - tidak bisa lihat

4. **Respons:**
   - Sarah (User IT) merespons: "Coba check charger nya dulu"
   - John (pembuat) upload foto: charger rusak
   - Budi (Admin IT) ubah status: new → in_progress
   - Budi merespons: "Akan dikirim teknisi untuk ganti charger"
   - Ahmad (User IT) ubah status: in_progress → resolved

### Skenario 2: Admin Bisa Lihat Ticket Divisinya

1. **Admin IT (Budi)** login dan buka dashboard
2. Sistem menampilkan tickets dengan:
   - `target_division = "IT"` (tickets yang ditujukan ke IT)
   - `user_division = "IT"` (tickets yang dibuat oleh user IT)
3. Contoh:
   - ✅ Ticket dari ACC/FINANCE → IT (target ke IT)
   - ✅ Ticket dari User IT → HR (dibuat dari IT)
   - ❌ Ticket dari HR → ACC/FINANCE (tidak ada hubungan dengan IT)
4. Budi bisa respons kedua jenis tickets tersebut

### Skenario 3: Super Admin Monitoring Semua Divisi

1. **Super Admin** login
2. Melihat SEMUA tickets dari semua divisi
3. Bisa filter berdasarkan divisi tertentu
4. Bisa merespons ticket divisi manapun
5. Bisa reassign ticket ke divisi lain jika NLP salah prediksi

## 🔐 Security Features

### 1. Division-Based Access Control
```typescript
// Check di setiap API endpoint
if (userRole === "admin" && ticket.target_division !== adminDivision) {
  return 403 Forbidden
}
```

### 2. Comment Access Control
```typescript
// Hanya bisa comment jika punya akses ke ticket
if (!hasAccessToTicket(user, ticket)) {
  return 403 Forbidden
}
```

### 3. Data Isolation
- User hanya lihat ticket mereka + ticket ke divisi mereka
- Admin hanya lihat ticket ke divisi mereka
- Super Admin lihat semua (untuk monitoring)

## 📈 Benefits

### Untuk User
- ✅ Ticket otomatis ke divisi yang tepat
- ✅ Tetap bisa lihat progress ticket mereka
- ✅ Bisa diskusi dengan divisi tujuan
- ✅ Transparansi siapa yang respons

### Untuk Admin
- ✅ Hanya lihat ticket relevan ke divisi mereka
- ✅ Tidak overwhelmed dengan ticket divisi lain
- ✅ Fokus handle masalah divisi sendiri
- ✅ Kolaborasi dengan user dari divisi lain

### Untuk Super Admin
- ✅ Monitor semua divisi
- ✅ Intervene jika ada masalah
- ✅ Reassign jika NLP salah routing
- ✅ Analytics cross-division

## 🧪 Testing Checklist

### Test User
- [ ] Buat ticket, pastikan masuk ke divisi yang benar (NLP)
- [ ] Bisa lihat ticket yang dibuat sendiri
- [ ] Bisa lihat ticket yang ditujukan ke divisi user
- [ ] TIDAK bisa lihat ticket divisi lain
- [ ] Bisa respons ticket sendiri
- [ ] Bisa respons ticket ke divisi user

### Test Admin
- [ ] Hanya lihat tickets untuk divisi admin
- [ ] TIDAK lihat tickets divisi lain
- [ ] Bisa respons semua tickets divisi sendiri
- [ ] Bisa ubah status tickets divisi sendiri
- [ ] Bisa upload foto bukti

### Test Super Admin
- [ ] Bisa lihat SEMUA tickets
- [ ] Bisa respons tickets divisi manapun
- [ ] Bisa ubah status tickets divisi manapun
- [ ] Bisa reassign tickets

## 🐛 Troubleshooting

### Ticket tidak muncul di divisi yang tepat
**Penyebab:** NLP mungkin salah prediksi
**Solusi:** Super Admin bisa edit `target_division` manual

### User tidak bisa respons ticket
**Error:** "Access denied - ticket not for your division"
**Penyebab:** User bukan pembuat DAN ticket tidak untuk divisi user
**Solusi:** Normal behavior - ticket hanya bisa direspons oleh divisi tujuan

### Admin bisa lihat ticket divisi lain
**Penyebab:** Bug di access control
**Check:** Pastikan `target_division` di database benar

## 📝 Migration Guide

Jika sudah punya sistem lama:

1. **Backup Database:**
   ```bash
   mysqldump -u root -p sistem_helpdesk_nlp > backup.sql
   ```

2. **Run Migrations:**
   ```bash
   mysql -u root -p sistem_helpdesk_nlp < scripts/08-refactor-add-target-division-nlp.sql
   mysql -u root -p sistem_helpdesk_nlp < scripts/10-add-ticket-comments.sql
   ```

3. **Update Existing Tickets:**
   ```sql
   -- Set target_division untuk tickets lama
   UPDATE tickets SET target_division = category WHERE target_division IS NULL;
   ```

4. **Test Access Control:**
   - Login sebagai user berbeda role
   - Verifikasi visibility sesuai aturan

## 🎓 Best Practices

1. **Naming Convention:** Gunakan nama divisi yang konsisten
2. **NLP Training:** Update NLP keywords secara berkala
3. **Monitoring:** Super Admin cek tickets yang ter-routing salah
4. **Documentation:** Dokumentasi divisi mana handle kategori apa
5. **User Training:** Edukasi user cara membuat ticket yang jelas

---

**Happy Ticketing! 🎫**
