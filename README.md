# Sistem Helpdesk Otomatis Berbasis NLP

## Klasifikasi Tiket dengan Natural Language Processing (Keyword-Based Classification)

Sistem helpdesk berbasis web dengan klasifikasi otomatis menggunakan **Natural Language Processing (NLP)** dan **Division-Based Routing System** untuk mendukung Bahasa Indonesia dan Bahasa Inggris.

> **Versi**: 2.0.0 | **Update Terakhir**: Januari 2026

---

## Daftar Isi

1. [Ringkasan Sistem](#ringkasan-sistem)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Metode NLP: Keyword-Based Classification](#metode-nlp-keyword-based-classification)
5. [Alur Sistem (System Flow)](#alur-sistem-system-flow)
6. [Fitur Utama](#fitur-utama)
7. [Struktur Database](#struktur-database)
8. [API Endpoints](#api-endpoints)
9. [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi)
10. [Komponen untuk Skripsi/Jurnal](#komponen-untuk-skripsijurnal)

---

## Ringkasan Sistem

Sistem Helpdesk NLP adalah aplikasi berbasis web yang dirancang untuk mengotomatisasi proses klasifikasi dan routing tiket helpdesk menggunakan teknik **Natural Language Processing (NLP)**. Sistem ini mampu menganalisis teks tiket dalam Bahasa Indonesia dan Bahasa Inggris, kemudian secara otomatis menentukan kategori dan divisi tujuan yang tepat.

### Permasalahan yang Diselesaikan

1. **Klasifikasi Manual yang Lambat**: Proses klasifikasi tiket secara manual membutuhkan waktu dan rentan kesalahan
2. **Routing Tidak Efisien**: Tiket sering salah diarahkan ke divisi yang tidak tepat
3. **Keterlambatan Respons**: Waktu respons lama karena tiket harus diproses manual
4. **Lack of Traceability**: Sulit melacak riwayat dan status tiket

### Solusi yang Ditawarkan

1. **Klasifikasi Otomatis**: Menggunakan NLP untuk mengklasifikasikan tiket secara otomatis
2. **Smart Routing**: Tiket diarahkan ke divisi yang tepat berdasarkan hasil klasifikasi
3. **Real-time Notification**: Notifikasi langsung ke pihak terkait
4. **Complete Audit Trail**: Riwayat lengkap semua aktivitas tiket

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   User      │  │   Admin     │  │ Super Admin │  │   Mobile    │        │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │  (Responsive)│       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────┬───────┴────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────────┐
│                         PRESENTATION LAYER                                   │
│                    ┌──────────────┴──────────────┐                          │
│                    │      Next.js 15 (React 19)   │                          │
│                    │      - Server Components     │                          │
│                    │      - Client Components     │                          │
│                    │      - App Router            │                          │
│                    └──────────────┬──────────────┘                          │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────────┐
│                          APPLICATION LAYER                                   │
│  ┌────────────────────────────────┴────────────────────────────────────┐    │
│  │                      Next.js API Routes                              │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │  Auth   │ │ Tickets │ │ Comments│ │  Users  │ │  Admin  │       │    │
│  │  │  API    │ │   API   │ │   API   │ │   API   │ │  Stats  │       │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                    ┌───────────────┴───────────────┐                        │
│                    │       NLP Service (Flask)      │                        │
│                    │   Keyword-Based Classification │                        │
│                    │         Port: 8000             │                        │
│                    └───────────────┬───────────────┘                        │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────────┐
│                            DATA LAYER                                        │
│                    ┌───────────────┴───────────────┐                        │
│                    │         MySQL Database         │                        │
│                    │    - Users & Authentication    │                        │
│                    │    - Tickets & Comments        │                        │
│                    │    - Notifications             │                        │
│                    │    - Division Mappings         │                        │
│                    └───────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Teknologi yang Digunakan

### Frontend (Client-Side)

| Teknologi        | Versi   | Fungsi                                                  |
| ---------------- | ------- | ------------------------------------------------------- |
| **Next.js**      | 15.0.0  | React framework dengan App Router dan Server Components |
| **React**        | 19.0.0  | Library untuk membangun user interface                  |
| **TypeScript**   | 5.x     | Superset JavaScript dengan static typing                |
| **Tailwind CSS** | 3.4.19  | Utility-first CSS framework                             |
| **Shadcn/ui**    | Latest  | Komponen UI modern berbasis Radix UI                    |
| **Recharts**     | 3.3.0   | Library visualisasi data untuk dashboard                |
| **Lucide React** | 0.408.0 | Icon library                                            |

### Backend (Server-Side)

| Teknologi                | Versi  | Fungsi                                |
| ------------------------ | ------ | ------------------------------------- |
| **Next.js API Routes**   | 15.0.0 | RESTful API endpoints                 |
| **MySQL**                | 8.x    | Relational database management system |
| **mysql2**               | 3.6.5  | MySQL client untuk Node.js            |
| **JSON Web Token (JWT)** | 9.0.2  | Autentikasi berbasis token            |
| **bcryptjs**             | 2.4.3  | Password hashing dengan salt          |

### NLP Service (Python)

| Teknologi        | Versi  | Fungsi                                             |
| ---------------- | ------ | -------------------------------------------------- |
| **Python**       | 3.10+  | Bahasa pemrograman untuk NLP service               |
| **Flask**        | 3.0.0  | Micro web framework untuk API                      |
| **Flask-CORS**   | 4.0.0  | Cross-Origin Resource Sharing                      |
| **Scikit-learn** | 1.2.2  | Machine learning library (tersedia untuk ekstensi) |
| **NumPy**        | 1.26.4 | Numerical computing                                |
| **Pandas**       | 2.0.3  | Data manipulation dan analysis                     |

### Tools & Utilities

| Teknologi      | Fungsi                                 |
| -------------- | -------------------------------------- |
| **ExcelJS**    | Export laporan ke format Excel (.xlsx) |
| **Nodemailer** | Pengiriman email notifikasi            |
| **date-fns**   | Manipulasi tanggal dan waktu           |

---

## Metode NLP: Keyword-Based Classification

### Penjelasan Metode

Sistem ini menggunakan metode **Keyword-Based Classification** untuk mengklasifikasikan tiket. Metode ini bekerja dengan mencocokkan kata kunci (keywords) dalam teks tiket dengan kamus kata kunci yang telah didefinisikan untuk setiap kategori/divisi.

### Algoritma Klasifikasi

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALUR KLASIFIKASI NLP                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT: Teks Tiket (Judul + Deskripsi)                          │
│         "Laptop saya tidak bisa nyala, layar mati"              │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────┐                │
│  │        1. TEXT PREPROCESSING                 │                │
│  │   • Lowercase conversion                     │                │
│  │   • Remove special characters                │                │
│  │   • Normalize whitespace                     │                │
│  │   Output: "laptop saya tidak bisa nyala      │                │
│  │            layar mati"                       │                │
│  └─────────────────────────────────────────────┘                │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────┐                │
│  │     2. KEYWORD MATCHING PER CATEGORY         │                │
│  │                                              │                │
│  │   IT Keywords: laptop ✓, mati ✓, layar ✓    │                │
│  │   HR Keywords: (no match)                    │                │
│  │   ACC/FINANCE: (no match)                    │                │
│  │   OPERASIONAL: (no match)                    │                │
│  │   ...                                        │                │
│  └─────────────────────────────────────────────┘                │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────┐                │
│  │        3. SCORE CALCULATION                  │                │
│  │                                              │                │
│  │   • Single word match: +2.0 × weight         │                │
│  │   • Multi-word phrase: +3.0 × weight         │                │
│  │   • Partial match:     +1.0 × weight         │                │
│  │                                              │                │
│  │   IT Score: 6.0 (laptop=2 + mati=2 + layar=2)│                │
│  │   Others: 0.0                                │                │
│  └─────────────────────────────────────────────┘                │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────┐                │
│  │    4. CONFIDENCE CALCULATION                 │                │
│  │                                              │                │
│  │   confidence = min(score / 10.0, 1.0)        │                │
│  │   confidence = min(6.0 / 10.0, 1.0) = 0.60   │                │
│  └─────────────────────────────────────────────┘                │
│                          │                                       │
│                          ▼                                       │
│  OUTPUT: {                                                       │
│    category: "IT",                                               │
│    confidence: 0.60,                                             │
│    matched_keywords: ["laptop", "mati", "layar"]                │
│  }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Kategori dan Kata Kunci

Sistem mendukung **7 kategori/divisi** dengan kata kunci dalam Bahasa Indonesia dan Inggris:

| Kategori             | Contoh Kata Kunci (ID)                                   | Contoh Kata Kunci (EN)                               |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| **IT**               | komputer, laptop, jaringan, wifi, error, password, email | computer, network, hardware, software, login, access |
| **HR**               | gaji, cuti, absen, karyawan, kontrak, training           | salary, leave, attendance, employee, contract        |
| **ACC/FINANCE**      | pembayaran, tagihan, invoice, keuangan, transfer         | payment, bill, invoice, finance, budget              |
| **OPERASIONAL**      | pengiriman, stok, gudang, mesin, produksi                | delivery, stock, warehouse, machine, production      |
| **SALES**            | penjualan, target, marketing, harga, diskon              | sales, target, marketing, price, discount            |
| **CUSTOMER SERVICE** | komplain, keluhan, layanan, garansi, retur               | complaint, service, warranty, return, refund         |
| **DIREKSI/DIREKTUR** | strategi, direksi, kebijakan, keputusan                  | strategy, director, policy, decision                 |

### Keunggulan Metode Keyword-Based

1. **Interpretable**: Mudah dipahami mengapa tiket diklasifikasikan ke kategori tertentu
2. **Fast Processing**: Waktu klasifikasi sangat cepat (< 100ms)
3. **Bilingual Support**: Mendukung kata kunci dalam dua bahasa
4. **Easily Customizable**: Kata kunci dapat ditambah/diubah tanpa retraining
5. **No Training Data Required**: Tidak memerlukan data latih dalam jumlah besar

### Confidence Score

Sistem menghitung **confidence score** untuk setiap prediksi:

| Range  | Level  | Interpretasi                           |
| ------ | ------ | -------------------------------------- |
| > 70%  | High   | Klasifikasi sangat yakin               |
| 50-70% | Medium | Klasifikasi cukup yakin                |
| < 50%  | Low    | Klasifikasi kurang yakin, perlu review |

---

## Alur Sistem (System Flow)

### 1. Alur Pembuatan Tiket Baru

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     ALUR PEMBUATAN TIKET BARU                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────┐                                                                  │
│  │  USER   │  1. Login ke sistem                                             │
│  │ACC/FIN  │                                                                  │
│  └────┬────┘                                                                  │
│       │                                                                       │
│       │  2. Buat Tiket Baru                                                   │
│       │     Judul: "Laptop rusak, tidak bisa menyala"                        │
│       │     Deskripsi: "Layar laptop mati total, sudah dicoba restart"       │
│       │     Lampiran: foto_laptop.jpg (optional)                             │
│       ▼                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │                     NEXT.JS API                               │            │
│  │  POST /api/tickets                                            │            │
│  │  • Validasi token JWT                                         │            │
│  │  • Simpan lampiran ke storage                                 │            │
│  │  • Kirim teks ke NLP Service                                  │            │
│  └──────────────────────────┬───────────────────────────────────┘            │
│                             │                                                 │
│                             ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │                    NLP SERVICE (Flask)                        │            │
│  │  POST /classify                                               │            │
│  │  • Preprocessing teks                                         │            │
│  │  • Keyword matching                                           │            │
│  │  • Score calculation                                          │            │
│  │                                                               │            │
│  │  Response: {                                                  │            │
│  │    category: "IT",                                            │            │
│  │    confidence: 0.75,                                          │            │
│  │    matched_keywords: ["laptop", "mati", "layar", "restart"]   │            │
│  │  }                                                            │            │
│  └──────────────────────────┬───────────────────────────────────┘            │
│                             │                                                 │
│                             ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │                    DATABASE (MySQL)                           │            │
│  │                                                               │            │
│  │  INSERT INTO tickets:                                         │            │
│  │  • id_user: 5 (pembuat tiket)                                │            │
│  │  • title: "Laptop rusak, tidak bisa menyala"                 │            │
│  │  • description: "Layar laptop mati total..."                 │            │
│  │  • status: "new"                                              │            │
│  │  • nlp_category: "IT"                                         │            │
│  │  • nlp_confidence: 0.75                                       │            │
│  │  • target_divisions: ["IT"]                                   │            │
│  │  • user_division: "ACC/FINANCE"                               │            │
│  └──────────────────────────┬───────────────────────────────────┘            │
│                             │                                                 │
│                             ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │                 NOTIFICATION SYSTEM                           │            │
│  │                                                               │            │
│  │  Kirim notifikasi ke:                                         │            │
│  │  ✅ Admin IT (target division)                                │            │
│  │  ✅ User IT (semua user di divisi target)                     │            │
│  │  ✅ Admin ACC/FINANCE (source division)                       │            │
│  │  ✅ Super Admin (semua tiket)                                 │            │
│  └──────────────────────────────────────────────────────────────┘            │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2. Alur Respons Tiket

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      ALUR RESPONS TIKET                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────┐    1. Terima Notifikasi                                         │
│  │ ADMIN IT│───────────────────────────────┐                                 │
│  └────┬────┘                               │                                 │
│       │                                    ▼                                 │
│       │  2. Buka Detail Tiket    ┌─────────────────────┐                     │
│       │                          │  Dashboard Admin    │                     │
│       │                          │  • List tiket masuk │                     │
│       │                          │  • Filter by status │                     │
│       │                          └──────────┬──────────┘                     │
│       │                                     │                                 │
│       │  3. Lihat Detail & Tanggapi         ▼                                 │
│       │                          ┌─────────────────────┐                     │
│       │                          │  Ticket Detail Modal│                     │
│       │                          │  • Info tiket       │                     │
│       │                          │  • Riwayat komentar │                     │
│       │                          │  • Form respons     │                     │
│       │                          └──────────┬──────────┘                     │
│       │                                     │                                 │
│       │  4. Tambah Komentar + Update Status │                                 │
│       │     "Sedang dalam pengecekan"       │                                 │
│       │     Status: New → In Progress       │                                 │
│       │                                     ▼                                 │
│       │                          ┌─────────────────────┐                     │
│       │                          │  POST /api/tickets/ │                     │
│       │                          │  [id]/comments      │                     │
│       │                          └──────────┬──────────┘                     │
│       │                                     │                                 │
│       │                                     ▼                                 │
│       │                          ┌─────────────────────┐                     │
│       │                          │  Database Update    │                     │
│       │                          │  • Insert comment   │                     │
│       │                          │  • Update status    │                     │
│       │                          │  • Create notif     │                     │
│       │                          └──────────┬──────────┘                     │
│       │                                     │                                 │
│       │                                     ▼                                 │
│       │                          ┌─────────────────────┐                     │
│       │                          │  Notifikasi ke:     │                     │
│       │                          │  • Pembuat tiket    │                     │
│       │                          │  • Pihak terkait    │                     │
│       │                          └─────────────────────┘                     │
│       │                                                                       │
└───────┴───────────────────────────────────────────────────────────────────────┘
```

### 3. Status Flow Tiket

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         STATUS FLOW TIKET                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────┐      ┌─────────────┐      ┌──────────┐      ┌────────┐     │
│    │   NEW   │ ───▶ │ IN_PROGRESS │ ───▶ │ RESOLVED │ ───▶ │ CLOSED │     │
│    │  (Baru) │      │  (Diproses) │      │ (Selesai)│      │(Ditutup)│    │
│    └─────────┘      └─────────────┘      └──────────┘      └────────┘     │
│         │                  │                   │                │          │
│         │                  │                   │                │          │
│    Tiket baru         Admin/User          Masalah           Tiket         │
│    dibuat             mulai proses        terselesaikan     ditutup       │
│                                                                             │
│    Warna: BIRU       Warna: KUNING       Warna: HIJAU     Warna: ABU      │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Fitur Utama

### 1. Multi-Role System

| Role            | Akses                 | Kemampuan                                             |
| --------------- | --------------------- | ----------------------------------------------------- |
| **User**        | Dashboard User        | Buat tiket, lihat tiket sendiri, respons tiket divisi |
| **Admin**       | Dashboard Admin       | Kelola tiket divisi, analytics, export laporan        |
| **Super Admin** | Dashboard Super Admin | Akses semua, kelola user, monitoring divisi           |

### 2. Division-Based Access Control

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MATRIX AKSES BERDASARKAN DIVISI                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Role                    │ Tiket Type          │ View │ Respond │ Status   │
│  ────────────────────────┼─────────────────────┼──────┼─────────┼──────────│
│  User (pembuat)          │ Tiket sendiri       │  ✅  │   ✅    │   ✅     │
│  User (target division)  │ Tiket → divisinya   │  ✅  │   ✅    │   ✅     │
│  User (source division)  │ Tiket dari divisinya│  ✅  │   ✅    │   ✅     │
│  User (other division)   │ Tiket tidak terkait │  ❌  │   ❌    │   ❌     │
│  Admin (target division) │ Tiket → divisinya   │  ✅  │   ✅    │   ✅     │
│  Admin (source division) │ Tiket dari divisinya│  ✅  │   ✅    │   ✅     │
│  Admin (other division)  │ Tiket tidak terkait │  ❌  │   ❌    │   ❌     │
│  Super Admin             │ Semua tiket         │  ✅  │   ✅    │   ✅     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Real-time Notification System

- **Badge notifikasi** di sidebar menunjukkan jumlah notifikasi belum dibaca
- **Notifikasi popup** saat ada tiket baru atau update
- **Email notification** (opsional) untuk tiket penting

### 4. Analytics Dashboard (Admin)

- **Total Tiket**: Jumlah tiket berdasarkan divisi
- **Total User**: Jumlah user di divisi
- **Tiket per Status**: Pie chart distribusi status
- **Tiket per Kategori**: Bar chart distribusi kategori
- **10 Tiket Terbaru**: List tiket terbaru yang masuk
- **Export Laporan**: PDF dan Excel dengan filter status

### 5. Dark Mode Support

Tema terang dan gelap yang dapat diubah sesuai preferensi pengguna.

---

## Struktur Database

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐       ┌─────────────────────────────────────┐          │
│  │     USERS       │       │              TICKETS                 │          │
│  ├─────────────────┤       ├─────────────────────────────────────┤          │
│  │ id (PK)         │──┐    │ id (PK)                             │          │
│  │ name            │  │    │ id_user (FK) ─────────────────────┐ │          │
│  │ email (UNIQUE)  │  └───▶│ title                              │ │          │
│  │ password        │       │ description                        │ │          │
│  │ role            │       │ status                              │ │          │
│  │ division        │       │ nlp_category                        │ │          │
│  │ token           │       │ nlp_confidence                      │ │          │
│  │ created_at      │       │ target_divisions (JSON)             │ │          │
│  └─────────────────┘       │ image_url                           │ │          │
│          │                 │ created_at                          │ │          │
│          │                 │ updated_at                          │ │          │
│          │                 └─────────────────────────────────────┘          │
│          │                              │                                    │
│          │                              │                                    │
│          │    ┌─────────────────────────┴──────────────────────────┐        │
│          │    │                                                     │        │
│          │    ▼                                                     ▼        │
│  ┌─────────────────────────┐             ┌───────────────────────────────┐  │
│  │   TICKET_COMMENTS       │             │        NOTIFICATIONS           │  │
│  ├─────────────────────────┤             ├───────────────────────────────┤  │
│  │ id (PK)                 │             │ id (PK)                        │  │
│  │ ticket_id (FK) ─────────┘             │ user_id (FK)                   │  │
│  │ user_id (FK)            │             │ ticket_id (FK)                 │  │
│  │ comment                 │             │ type                           │  │
│  │ old_status              │             │ message                        │  │
│  │ new_status              │             │ reason                         │  │
│  │ image_url               │             │ is_read                        │  │
│  │ created_at              │             │ created_at                     │  │
│  └─────────────────────────┘             └───────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────┐                                      │
│  │   CATEGORY_DIVISION_MAPPING       │                                      │
│  ├───────────────────────────────────┤                                      │
│  │ id (PK)                           │                                      │
│  │ category                          │                                      │
│  │ division                          │                                      │
│  │ keywords (JSON)                   │                                      │
│  └───────────────────────────────────┘                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tabel Users

| Field      | Type         | Description                    |
| ---------- | ------------ | ------------------------------ |
| id         | INT (PK, AI) | Primary key                    |
| name       | VARCHAR(100) | Nama lengkap user              |
| email      | VARCHAR(100) | Email (unique)                 |
| password   | VARCHAR(255) | Password hash (bcrypt)         |
| role       | ENUM         | 'user', 'admin', 'super_admin' |
| division   | VARCHAR(50)  | Divisi user                    |
| token      | VARCHAR(500) | JWT token aktif                |
| created_at | TIMESTAMP    | Waktu registrasi               |

### Tabel Tickets

| Field            | Type         | Description                                |
| ---------------- | ------------ | ------------------------------------------ |
| id               | INT (PK, AI) | Primary key                                |
| id_user          | INT (FK)     | ID pembuat tiket                           |
| title            | VARCHAR(255) | Judul tiket                                |
| description      | TEXT         | Deskripsi masalah                          |
| status           | ENUM         | 'new', 'in_progress', 'resolved', 'closed' |
| nlp_category     | VARCHAR(50)  | Kategori hasil klasifikasi NLP             |
| nlp_confidence   | DECIMAL(5,2) | Confidence score (0.00 - 1.00)             |
| target_divisions | JSON         | Array divisi tujuan                        |
| image_url        | VARCHAR(500) | URL lampiran gambar                        |
| created_at       | TIMESTAMP    | Waktu pembuatan                            |
| updated_at       | TIMESTAMP    | Waktu update terakhir                      |

### Tabel Ticket_Comments

| Field      | Type         | Description           |
| ---------- | ------------ | --------------------- |
| id         | INT (PK, AI) | Primary key           |
| ticket_id  | INT (FK)     | ID tiket              |
| user_id    | INT (FK)     | ID user yang komentar |
| comment    | TEXT         | Isi komentar          |
| old_status | VARCHAR(20)  | Status sebelum diubah |
| new_status | VARCHAR(20)  | Status setelah diubah |
| image_url  | VARCHAR(500) | URL lampiran bukti    |
| created_at | TIMESTAMP    | Waktu komentar        |

---

## API Endpoints

### Authentication API

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/api/auth/login`    | Login user, return JWT token |
| POST   | `/api/auth/register` | Register user baru           |

### Tickets API

| Method | Endpoint                          | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/tickets`                    | Get semua tiket (filtered by role)   |
| POST   | `/api/tickets`                    | Buat tiket baru + NLP classification |
| GET    | `/api/tickets/[id]`               | Get detail tiket                     |
| PATCH  | `/api/tickets/[id]`               | Update tiket (status, etc.)          |
| DELETE | `/api/tickets/[id]`               | Hapus tiket (Super Admin only)       |
| GET    | `/api/tickets/by-target-division` | Get tiket untuk divisi tertentu      |

### Comments API

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| GET    | `/api/tickets/[id]/comments` | Get semua komentar tiket |
| POST   | `/api/tickets/[id]/comments` | Tambah komentar/respons  |

### NLP API (Flask Service)

| Method | Endpoint             | Description                       |
| ------ | -------------------- | --------------------------------- |
| GET    | `/health`            | Health check                      |
| POST   | `/classify`          | Klasifikasi teks tunggal          |
| POST   | `/classify-enhanced` | Klasifikasi dengan detail lengkap |
| POST   | `/classify-batch`    | Klasifikasi multiple teks         |
| GET    | `/categories`        | Get semua kategori dan keywords   |

### Admin API

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| GET    | `/api/admin/stats`         | Get statistik dashboard |
| GET    | `/api/admin/notifications` | Get notifikasi admin    |
| POST   | `/api/admin/reports/pdf`   | Export laporan PDF      |
| POST   | `/api/admin/reports/excel` | Export laporan Excel    |

### User API

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | `/api/user/profile`       | Get profil user     |
| PATCH  | `/api/user/profile`       | Update profil       |
| GET    | `/api/user/notifications` | Get notifikasi user |

---

## Instalasi dan Konfigurasi

### Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL 8.0+
- Git

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd sistem-helpdesk-nlp-sjpl

# 2. Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan konfigurasi database dan JWT secret

# 3. Install Node.js dependencies
npm install

# 4. Setup database
mysql -u root -p < scripts/01-init-database.sql
# ... jalankan semua script migration

# 5. Setup NLP Service
cd nlp_api
pip install -r requirements.txt

# 6. Jalankan aplikasi
# Terminal 1: NLP Service
cd nlp_api && python app.py

# Terminal 2: Next.js
npm run dev
```

---

## Komponen untuk Skripsi/Jurnal

### 1. BAB Pendahuluan

- **Latar Belakang**: Permasalahan klasifikasi manual tiket helpdesk
- **Rumusan Masalah**: Bagaimana mengotomatisasi klasifikasi tiket dengan NLP
- **Tujuan**: Membangun sistem helpdesk dengan klasifikasi otomatis
- **Manfaat**: Efisiensi waktu, akurasi routing, traceability

### 2. BAB Tinjauan Pustaka

- **Natural Language Processing (NLP)**
  - Definisi dan konsep dasar
  - Text preprocessing (lowercase, normalization)
  - Keyword extraction dan matching

- **Keyword-Based Classification**
  - Prinsip kerja
  - Keunggulan vs machine learning
  - Aplikasi dalam text classification

- **Sistem Helpdesk**
  - Definisi dan fungsi
  - Komponen sistem helpdesk
  - Workflow tiket

- **Teknologi Web Modern**
  - Next.js dan React
  - RESTful API
  - MySQL Database

### 3. BAB Metodologi

- **Metode Pengembangan**: Agile/Waterfall
- **Arsitektur Sistem**: 3-tier architecture
- **Algoritma Klasifikasi**:

  ```
  Algoritma Keyword-Based Classification:

  INPUT: text (string)
  OUTPUT: {category, confidence, matched_keywords}

  1. PREPROCESS(text):
     a. text = lowercase(text)
     b. text = remove_special_chars(text)
     c. text = normalize_whitespace(text)
     d. RETURN text

  2. CALCULATE_SCORE(text, keywords, weight):
     a. processed_text = PREPROCESS(text)
     b. words = split(processed_text)
     c. score = 0
     d. matched = []
     e. FOR each keyword in keywords:
        - IF keyword is multi-word AND keyword in processed_text:
            score += 3.0 * weight
            matched.append(keyword)
        - ELSE IF keyword in words:
            score += 2.0 * weight
            matched.append(keyword)
        - ELSE IF partial_match(keyword, words):
            score += 1.0 * weight
            matched.append(keyword)
     f. RETURN (score, matched)

  3. CLASSIFY(text):
     a. results = {}
     b. FOR each (category, config) in CATEGORIES:
        - score, matched = CALCULATE_SCORE(text, config.keywords, config.weight)
        - results[category] = {score, matched}
     c. best_category = argmax(results, key=score)
     d. confidence = min(best_score / 10.0, 1.0)
     e. RETURN {category: best_category, confidence, matched_keywords}
  ```

### 4. BAB Hasil dan Pembahasan

- **Implementasi Sistem**
  - Screenshot UI
  - Penjelasan fitur

- **Pengujian Klasifikasi NLP**
  - Contoh kasus klasifikasi
  - Akurasi sistem
  - Waktu respons

- **Evaluasi Sistem**
  - Usability testing
  - Performance testing
  - User acceptance testing

### 5. BAB Kesimpulan

- Ringkasan hasil
- Kelebihan dan kekurangan
- Saran pengembangan (misal: implementasi ML untuk akurasi lebih tinggi)

### 6. Diagram yang Diperlukan

1. **Use Case Diagram**: Interaksi aktor dengan sistem
2. **Activity Diagram**: Alur proses pembuatan dan respons tiket
3. **Sequence Diagram**: Komunikasi antar komponen
4. **Class Diagram**: Struktur data dan relasi
5. **ERD**: Struktur database
6. **Flowchart**: Algoritma klasifikasi NLP
7. **Architecture Diagram**: Arsitektur sistem keseluruhan

---

## Struktur Folder Project

```
sistem-helpdesk-nlp-sjpl/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── tickets/              # Ticket CRUD + comments
│   │   ├── admin/                # Admin endpoints
│   │   ├── user/                 # User endpoints
│   │   └── nlp/                  # NLP proxy endpoint
│   ├── dashboard/                # User Dashboard pages
│   ├── admin/                    # Admin Dashboard pages
│   ├── super-admin/              # Super Admin Dashboard pages
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React Components
│   ├── ui/                       # Shadcn UI components
│   ├── dashboard-sidebar.tsx     # Multi-role sidebar
│   ├── ticket-form.tsx           # Create ticket form
│   ├── ticket-list.tsx           # User's tickets list
│   ├── ticket-detail-modal.tsx   # Ticket detail & comments
│   ├── admin-stats.tsx           # Admin analytics dashboard
│   ├── admin-report.tsx          # Export report component
│   └── ...                       # Other components
│
├── lib/                          # Utility Libraries
│   ├── db.ts                     # MySQL connection pool
│   ├── auth.ts                   # JWT utilities
│   └── utils.ts                  # Helper functions
│
├── nlp_api/                      # Flask NLP Service
│   ├── app.py                    # Flask server
│   ├── requirements.txt          # Python dependencies
│   └── utils/
│       └── classifier.py         # Keyword-based classifier
│
├── scripts/                      # Database migrations
│   ├── 01-init-database.sql
│   ├── 02-add-division-field.sql
│   └── ...
│
├── public/                       # Static assets
│   └── uploads/                  # User uploads
│
└── README.md                     # Documentation (this file)
```

---

## Credits

**Nama Project**: Sistem Helpdesk Otomatis Berbasis NLP

**Versi**: 2.0.0

**Tanggal Update**: Januari 2026

---

_Dokumentasi ini disusun untuk keperluan skripsi dan jurnal akademik._
