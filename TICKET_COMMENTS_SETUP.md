# Setup Sistem Komentar & Respons Tiket

## Fitur Baru
Sistem ini menambahkan kemampuan untuk semua role (User, Admin, Super Admin) untuk:
- ✅ Merespons ticket dengan komentar
- ✅ Mengubah status ticket
- ✅ Upload bukti foto sebagai balasan
- ✅ Melihat riwayat lengkap komunikasi ticket
- ✅ Menampilkan nama dan role dari setiap responder

## Instalasi Database

### 1. Jalankan Migration SQL
Jalankan file SQL migration untuk membuat tabel `ticket_comments`:

```bash
mysql -u root -p sistem_helpdesk_nlp < scripts/10-add-ticket-comments.sql
```

Atau login ke MySQL dan jalankan:
```sql
SOURCE scripts/10-add-ticket-comments.sql;
```

### 2. Verifikasi Tabel
Pastikan tabel sudah dibuat dengan benar:
```sql
USE sistem_helpdesk_nlp;
SHOW TABLES;
DESCRIBE ticket_comments;
```

## Struktur Tabel ticket_comments

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| ticket_id | INT | Foreign key ke tickets |
| user_id | INT | Foreign key ke users (yang memberi komentar) |
| comment | TEXT | Isi komentar/tanggapan |
| comment_type | ENUM | Tipe: 'comment', 'status_change', 'response' |
| old_status | VARCHAR(50) | Status lama (jika ada perubahan status) |
| new_status | VARCHAR(50) | Status baru (jika ada perubahan status) |
| attachment_path | VARCHAR(500) | Path ke file bukti foto |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

## Cara Menggunakan

### User
1. Buka halaman "Tiket Saya"
2. Klik tombol "Lihat Detail & Respons" pada ticket
3. Tulis tanggapan di form
4. (Opsional) Upload bukti foto
5. Klik "Kirim Tanggapan"

### Admin
1. Buka halaman "Kelola Tiket"
2. Klik ticket yang ingin direspons
3. Ubah status ticket jika diperlukan (New → In Progress → Resolved)
4. Tulis tanggapan/solusi
5. (Opsional) Upload bukti penyelesaian
6. Klik "Kirim Tanggapan"

### Super Admin
1. Buka halaman "All Tickets"
2. Klik ticket yang ingin direspons
3. Dapat melihat dan merespons semua ticket dari semua divisi
4. Sama seperti Admin, bisa ubah status dan upload foto

## API Endpoints

### GET /api/tickets/[id]
Mengambil detail ticket beserta informasi user
```typescript
Response: {
  ticket: {
    id: number
    title: string
    description: string
    category: string
    status: string
    target_division: string
    created_at: string
    user_name: string
    user_email: string
    user_role: string
    user_division: string
    image_path: string
  }
}
```

### GET /api/tickets/[id]/comments
Mengambil semua komentar untuk ticket tertentu
```typescript
Response: {
  comments: [
    {
      id: number
      ticket_id: number
      user_id: number
      comment: string
      comment_type: string
      old_status: string | null
      new_status: string | null
      attachment_path: string | null
      created_at: string
      user_name: string
      user_email: string
      user_role: string
      user_division: string | null
    }
  ]
}
```

### POST /api/tickets/[id]/comments
Menambahkan komentar/respons baru
```typescript
Request (FormData):
- comment: string
- commentType: 'comment' | 'status_change' | 'response'
- oldStatus: string | null
- newStatus: string | null
- attachment: File | null

Response: {
  message: string
  comment: Comment
}
```

## Komponen React

### TicketDetailModal
Komponen modal untuk menampilkan detail ticket dan form respons:
```typescript
<TicketDetailModal
  isOpen={boolean}
  onClose={() => void}
  ticketId={number | null}
  onUpdate={() => void}
/>
```

### TicketList (Updated)
Sekarang memiliki tombol "Lihat Detail & Respons" untuk membuka modal

## Upload Directory
Pastikan directory untuk upload foto ada:
```bash
mkdir -p public/uploads/comments
chmod 755 public/uploads/comments
```

## Catatan Penting
1. Semua role dapat merespons ticket yang relevan dengan divisi mereka
2. Super Admin dapat merespons semua ticket
3. User hanya dapat merespons ticket mereka sendiri
4. Setiap respons menampilkan nama, role, dan divisi dari responder
5. Perubahan status ticket dicatat dalam riwayat
6. Bukti foto disimpan di `/uploads/comments/`

## Troubleshooting

### Error: Cannot create comments table
- Pastikan tabel `tickets` dan `users` sudah ada
- Periksa foreign key constraints

### Error: Upload folder not found
```bash
mkdir -p public/uploads/comments
```

### Error: File too large
- Default Next.js limit: 4MB
- Edit `next.config.js` untuk menambah limit

### Error: 404 on /api/tickets/[id]/comments
- Pastikan file route ada di `app/api/tickets/[id]/comments/route.ts`
- Restart dev server
