# Perbaikan Sistem Respons Ticket Berbasis Divisi

## 🔧 Masalah yang Diperbaiki

User melaporkan bahwa **user dari divisi yang dituju** masih:
1. ❌ Belum mendapat notifikasi ticket
2. ❌ Belum bisa memberi respond
3. ❌ Belum bisa menanggapi
4. ❌ Belum bisa mengedit status ticket
5. ❌ Belum bisa mengupload foto bukti

## ✅ Solusi yang Diterapkan

### 1. **Integrasi DivisionTicketList Component**

#### Masalah:
- Component `DivisionTicketList` sudah dibuat tapi TIDAK PERNAH DIGUNAKAN di dashboard
- Admin dashboard menggunakan `AdminDivisionTickets` (component lama)
- User dashboard menggunakan `TicketList` (hanya ticket sendiri)

#### Solusi:
**File: `app/admin/dashboard/page.tsx`**
```typescript
// SEBELUM
import { AdminDivisionTickets } from "@/components/admin-division-tickets"

{activeTab === "tickets" && (
  <AdminDivisionTickets selectedTicketId={selectedTicketId} />
)}

// SESUDAH
import { DivisionTicketList } from "@/components/division-ticket-list"

{activeTab === "tickets" && (
  <DivisionTicketList refreshTrigger={refreshTrigger} />
)}
```

**File: `app/dashboard/page.tsx`**
```typescript
// DITAMBAHKAN
import { DivisionTicketList } from "@/components/division-ticket-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sekarang user punya 2 tab:
<Tabs defaultValue="my-tickets">
  <TabsList>
    <TabsTrigger value="my-tickets">Tiket Saya</TabsTrigger>
    <TabsTrigger value="division-tickets">Tiket Divisi</TabsTrigger>
  </TabsList>

  <TabsContent value="my-tickets">
    <TicketList refreshTrigger={refreshTrigger} />
  </TabsContent>

  <TabsContent value="division-tickets">
    <DivisionTicketList refreshTrigger={refreshTrigger} />
  </TabsContent>
</Tabs>
```

### 2. **Notifikasi untuk User di Target Division**

#### Masalah:
- Sistem hanya mengirim notifikasi ke **admin**
- User biasa di target division TIDAK mendapat notifikasi

#### Solusi:
**File: `lib/ticket-routing.ts`**

Ditambahkan fungsi baru `getUsersForTicket()`:
```typescript
export async function getUsersForTicket(
  userDivision: string,
  nlpCategory: string,
  ticketCreatorId: number
): Promise<Array<{
  id: number
  name: string
  email: string
  division: string
  role: string
  notification_reason: 'target_division'
}>> {
  // Get all users from target divisions (NLP routing)
  for (const division of routing.nlpDivisions) {
    // Get users from this division (excluding ticket creator)
    const divisionUsers = await query(
      `SELECT id, name, email, division, role
       FROM users
       WHERE role = 'user' AND division = ? AND is_active = TRUE AND id != ?`,
      [division, ticketCreatorId]
    )
    // ... add to users array
  }
}
```

Update fungsi `createTicketNotifications()`:
```typescript
export async function createTicketNotifications(...) {
  const admins = await getAdminsForTicket(userDivision, nlpCategory)
  const users = await getUsersForTicket(userDivision, nlpCategory, userId)

  // Create admin notifications (ke tabel `notifications`)
  for (const admin of admins) {
    await query(
      `INSERT INTO notifications
       (id_admin, id_ticket, id_user, title, message, notification_reason, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [admin.id, ticketId, userId, title, message, admin.notification_reason, false]
    )
  }

  // Create user notifications (ke tabel `user_notifications`)
  for (const user of users) {
    const message = `Tiket baru di divisi Anda dari ${userName} (${userDivision}) - Kategori: ${nlpCategory}`

    await query(
      `INSERT INTO user_notifications
       (id_user, id_ticket, ticket_title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, ticketId, title, message, 'status_update', false]
    )
  }

  console.log(`Created ${admins.length} admin + ${users.length} user notifications`)
}
```

## 📊 Cara Kerja Lengkap

### Skenario: User ACC/FINANCE → IT Division

1. **User ACC/FINANCE membuat ticket "Laptop rusak"**
   ```
   NLP prediksi: category="Hardware", target_division="IT"
   ```

2. **Sistem membuat ticket dengan routing**
   ```sql
   INSERT INTO tickets (
     ...
     user_division = "ACC/FINANCE",
     target_division = "IT",
     ...
   )
   ```

3. **Sistem mengirim notifikasi ke:**
   - ✅ Admin IT (dapat notifikasi di `notifications` table)
   - ✅ **User IT** (dapat notifikasi di `user_notifications` table) ← **BARU!**
   - ✅ Admin ACC/FINANCE (pembuat di divisi yang sama)
   - ✅ Super Admin

4. **User IT login dan buka dashboard:**
   - Melihat badge notifikasi (merah) di sidebar
   - Klik "Tiket Divisi" tab
   - Melihat ticket dari ACC/FINANCE
   - Klik "Lihat Detail & Tanggapi"
   - Modal terbuka dengan TicketDetailModal

5. **User IT bisa:**
   - ✅ Membaca detail ticket lengkap
   - ✅ Melihat history semua respons
   - ✅ Menambahkan komentar/respons
   - ✅ Mengubah status (new → in_progress → resolved)
   - ✅ Upload foto bukti
   - ✅ Melihat siapa yang respons (badge role)

## 🔄 Access Control Matrix (Updated)

| Role | Ticket Type | Can See? | Can Respond? | Can Change Status? | Can Upload Photo? |
|------|------------|----------|--------------|-------------------|-------------------|
| **User (pembuat)** | Ticket sendiri | ✅ | ✅ | ✅ | ✅ |
| **User (divisi target)** | Ticket → divisinya | ✅ | ✅ | ✅ | ✅ |
| **User (divisi sumber)** | Ticket dari divisinya | ✅ | ✅ | ✅ | ✅ |
| **User (divisi lain)** | Ticket tidak terkait | ❌ | ❌ | ❌ | ❌ |
| **Admin (divisi target)** | Ticket → divisinya | ✅ | ✅ | ✅ | ✅ |
| **Admin (divisi sumber)** | Ticket dari divisinya | ✅ | ✅ | ✅ | ✅ |
| **Admin (divisi lain)** | Ticket tidak terkait | ❌ | ❌ | ❌ | ❌ |
| **Super Admin** | Semua ticket | ✅ | ✅ | ✅ | ✅ |

## 🔍 Endpoint API yang Digunakan

### 1. **GET /api/tickets/by-target-division**
Digunakan oleh `DivisionTicketList` component.

**Access Control:**
```typescript
if (role === "user") {
  // Return tickets where:
  // 1. User created it (id_user = userId)
  // 2. Target division = user's division
  // 3. Created FROM user's division (user_division = userDivision)
  WHERE t.id_user = ? OR t.target_division = ? OR u.division = ?
}
else if (role === "admin") {
  // Return tickets where:
  // 1. Target division = admin's division
  // 2. Created FROM admin's division
  WHERE t.target_division = ? OR u.division = ?
}
else if (role === "super_admin") {
  // Return ALL tickets
  SELECT * FROM tickets
}
```

### 2. **GET /api/tickets/[id]/comments**
Mendapatkan semua komentar untuk ticket.

**Access Control:** Sama dengan endpoint ticket detail.

### 3. **POST /api/tickets/[id]/comments**
Menambahkan komentar/respons baru dengan file upload.

**Input:**
- `comment` (text)
- `commentType` ('comment' | 'status_change' | 'response')
- `oldStatus`, `newStatus` (untuk status change)
- `attachment` (file, optional)

**Output:**
- Comment baru dengan info user yang respons

## 📱 Components yang Digunakan

### 1. **DivisionTicketList**
[components/division-ticket-list.tsx](components/division-ticket-list.tsx)

**Features:**
- Auto-filter berdasarkan role & division
- Menampilkan badge "Dari: {division}" dan "Ke: {target_division}"
- Menampilkan jumlah respons
- Tombol "Lihat Detail & Tanggapi"

### 2. **TicketDetailModal**
[components/ticket-detail-modal.tsx](components/ticket-detail-modal.tsx)

**Features:**
- Menampilkan info pembuat ticket (nama, role, divisi)
- Riwayat lengkap semua respons dengan info responder
- Form untuk tambah respons
- Upload foto bukti
- Dropdown ubah status ticket
- Badge role untuk setiap responder

## 🧪 Cara Testing

### Test Case 1: User di Target Division Dapat Notifikasi

1. Login sebagai **User IT**
2. User **ACC/FINANCE** buat ticket "Printer rusak"
3. NLP prediksi → kategori "Hardware" → target_division "IT"
4. **Expected:**
   - ✅ User IT melihat badge notifikasi (angka merah di sidebar)
   - ✅ Klik notifikasi, muncul list notifikasi
   - ✅ Klik notifikasi, redirect ke ticket detail

### Test Case 2: User di Target Division Bisa Respons

1. Login sebagai **User IT**
2. Buka "Dashboard" → klik tab "**Tiket Divisi**"
3. Lihat ticket dari ACC/FINANCE tentang "Printer rusak"
4. Klik "**Lihat Detail & Tanggapi**"
5. Modal terbuka, isi respons: "Sedang kami check, mohon tunggu"
6. Klik "Kirim Respons"
7. **Expected:**
   - ✅ Respons muncul di riwayat
   - ✅ Nama User IT muncul sebagai responder
   - ✅ Badge "User" muncul

### Test Case 3: User di Target Division Bisa Ubah Status

1. Lanjut dari Test Case 2
2. Pilih status baru: "**In Progress**"
3. Isi komentar: "Teknisi sedang menuju lokasi"
4. Klik "Kirim Respons"
5. **Expected:**
   - ✅ Status ticket berubah menjadi "In Progress"
   - ✅ Riwayat menunjukkan perubahan status
   - ✅ Badge status di card ticket berubah warna

### Test Case 4: User di Target Division Bisa Upload Foto

1. Lanjut dari Test Case 3
2. Klik "Choose File" di form respons
3. Upload foto: "printer_diperbaiki.jpg"
4. Isi komentar: "Printer sudah diperbaiki, sudah bisa dipakai"
5. Ubah status → "**Resolved**"
6. Klik "Kirim Respons"
7. **Expected:**
   - ✅ Foto muncul di riwayat respons
   - ✅ Status berubah "Resolved"
   - ✅ Komentar muncul di riwayat

### Test Case 5: User dari Divisi Lain TIDAK Bisa Lihat

1. Login sebagai **User HR**
2. Buka "Dashboard" → klik tab "**Tiket Divisi**"
3. **Expected:**
   - ✅ Ticket "Printer rusak" (ACC/FINANCE → IT) TIDAK MUNCUL
   - ✅ User HR hanya lihat ticket yang ditujukan ke HR
   - ✅ User HR hanya lihat ticket yang dibuat dari HR

## 📈 Monitoring & Debugging

### Check Notifications di Database

```sql
-- Admin notifications
SELECT n.*, t.title, u.name as admin_name
FROM notifications n
JOIN users u ON n.id_admin = u.id
JOIN tickets t ON n.id_ticket = t.id
WHERE n.is_read = FALSE
ORDER BY n.created_at DESC;

-- User notifications
SELECT un.*, u.name as user_name, u.division
FROM user_notifications un
JOIN users u ON un.id_user = u.id
WHERE un.is_read = FALSE
ORDER BY un.created_at DESC;
```

### Check Ticket Routing

```sql
SELECT
  t.id,
  t.title,
  t.user_division AS from_division,
  t.target_division AS to_division,
  t.nlp_category,
  u.name AS created_by,
  t.created_at
FROM tickets t
JOIN users u ON t.id_user = u.id
ORDER BY t.created_at DESC
LIMIT 10;
```

### Check Access Control

```sql
-- Siapa saja yang bisa lihat ticket tertentu?
-- Example: ticket_id = 123

SELECT DISTINCT u.id, u.name, u.email, u.role, u.division,
  CASE
    WHEN t.id_user = u.id THEN 'Creator'
    WHEN t.target_division = u.division THEN 'Target Division'
    WHEN t.user_division = u.division THEN 'Source Division'
    WHEN u.role = 'super_admin' THEN 'Super Admin'
    ELSE 'No Access'
  END AS access_reason
FROM tickets t
CROSS JOIN users u
WHERE t.id = 123
  AND (
    t.id_user = u.id  -- Creator
    OR t.target_division = u.division  -- Target division
    OR t.user_division = u.division  -- Source division
    OR u.role = 'super_admin'  -- Super admin
  )
ORDER BY u.role, u.division;
```

## 🎯 Summary

### Perubahan yang Dilakukan:

1. ✅ **Integrasi DivisionTicketList** di admin & user dashboard
2. ✅ **Notifikasi untuk user** di target division (tidak hanya admin)
3. ✅ **Tab "Tiket Divisi"** di user dashboard untuk lihat ticket divisi
4. ✅ **Access control** yang benar di semua endpoint

### Fitur yang Sekarang Berfungsi:

1. ✅ User di target division **mendapat notifikasi**
2. ✅ User di target division **bisa melihat ticket**
3. ✅ User di target division **bisa respons/komentar**
4. ✅ User di target division **bisa ubah status**
5. ✅ User di target division **bisa upload foto bukti**
6. ✅ User di divisi lain **TIDAK bisa lihat** (security)

---

**Status: ✅ SELESAI - Sistem respons berbasis divisi sudah berfungsi penuh!**
