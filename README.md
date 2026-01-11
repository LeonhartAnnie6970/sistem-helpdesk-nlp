# Helpdesk NLP SJPL

Sistem helpdesk otomatis berbasis web dengan klasifikasi Natural Language Processing (NLP) dan **Division-Based Routing System** untuk Bahasa Indonesia dan Inggris.

> **📌 Update Januari 2026**: Sistem sekarang mendukung **Multi-Division Routing** dengan JSON array `target_divisions` dan **Ticket Inbox/Outbox** untuk tracking yang lebih baik!

## Fitur Utama

### 🎯 Core Features

- **Klasifikasi Otomatis dengan NLP**: Sistem NLP secara otomatis mengklasifikasikan tiket ke kategori yang tepat menggunakan TF-IDF + Naive Bayes
- **Division-Based Routing**: Tiket otomatis diarahkan ke divisi yang sesuai berdasarkan prediksi NLP
- **Bilingual Support**: Mendukung Bahasa Indonesia dan Inggris dengan translasi otomatis
- **Real-time Notifications**: Notifikasi langsung untuk admin dan user di divisi target
- **Collaborative Response System**: Semua role (User, Admin, Super Admin) dapat merespons ticket dengan komentar, status update, dan upload foto bukti

### 👥 User Management

- **Multi-Role System**: User, Admin, Super Admin dengan akses berbeda
- **Division-Based Access Control**: User/Admin hanya bisa lihat ticket yang relevan dengan divisinya
- **JWT Authentication**: Sistem autentikasi aman dengan JSON Web Token
- **User Profile Management**: Edit profil, ganti password, notifikasi email

### 📊 Dashboard & Analytics

- **Admin Stats**: Statistik lengkap dengan grafik real-time (ticket per status, kategori, divisi)
- **Division Monitoring**: Super Admin dapat monitor semua divisi
- **Dark Mode Support**: Tema terang dan gelap yang dapat diubah sesuai preferensi

### 💬 Ticket Response System

- **Multi-Level Response**: User, Admin, dan Super Admin dapat merespons ticket
- **Status Tracking**: Update status ticket (New → In Progress → Resolved → Closed)
- **File Upload**: Upload foto bukti saat membuat ticket atau merespons
- **Comment History**: Riwayat lengkap semua respons dengan info responder (nama, role, divisi)
- **Access Control**: Hanya user/admin dari divisi terkait yang bisa akses dan respons

## Teknologi

### Frontend

- **Next.js 15.5.9**: React framework dengan App Router
- **React 19**: Latest React with Server Components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Dashboard visualization
- **Shadcn/ui**: Modern UI components

### Backend

- **Next.js API Routes**: RESTful API endpoints
- **MySQL**: Relational database dengan connection pooling
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing

### NLP Engine

- **Flask**: Python web framework
- **Scikit-learn**: Machine learning library
- **TF-IDF**: Text feature extraction
- **Naive Bayes**: Classification algorithm
- **Google Translate API**: Bilingual support

## Divisi & Kategori

### Divisi yang Tersedia:

- **IT**: Information Technology
- **HR**: Human Resources
- **ACC/FINANCE**: Accounting & Finance
- **OPERASIONAL**: Operations
- **GENERAL**: General inquiries

### Kategori NLP:

- **IT Support**: Hardware, software, network issues
- **HR**: Payroll, leave, employee services
- **ACC/FINANCE**: Invoice, payment, financial reports
- **OPERASIONAL**: Operational issues, facilities
- **GENERAL**: General inquiries

### Routing Logic:

Ketika user membuat ticket, sistem NLP akan:

1. Analisis judul + deskripsi ticket
2. Prediksi kategori berdasarkan keywords
3. Route ticket ke divisi yang sesuai
4. Kirim notifikasi ke admin & user di divisi target

**Contoh:**

- User ACC/FINANCE buat ticket: "Laptop rusak, layar mati"
- NLP prediksi: kategori = "Hardware" → divisi = "IT"
- Notifikasi dikirim ke: Admin IT + User IT + Super Admin
- Semua yang dapat notifikasi bisa lihat & respons ticket

## Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd sistem-helpdesk-nlp-sjpl
```

### 2. Environment Variables (REQUIRED)

Copy `.env.example` to `.env.local` dan konfigurasi:

```bash
cp .env.example .env.local
```

**Variabel wajib:**

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/helpdesk_nlp

# JWT Secret (generate dengan command di bawah)
JWT_SECRET=your-super-secret-key-here

# NLP API
NLP_API_URL=http://localhost:8000
```

**Generate JWT Secret:**

```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Linux/Mac
openssl rand -hex 32
```

### 3. Database Setup

Jalankan semua migration scripts secara berurutan:

```bash
mysql -u root -p < scripts/01-init-database.sql
mysql -u root -p < scripts/02-add-division-field.sql
mysql -u root -p < scripts/03-add-nlp-fields.sql
mysql -u root -p < scripts/04-add-target-division.sql
mysql -u root -p < scripts/05-add-notifications-table.sql
mysql -u root -p < scripts/06-update-notifications.sql
mysql -u root -p < scripts/07-add-notification-reason.sql
mysql -u root -p < scripts/08-add-category-division-mapping.sql
mysql -u root -p < scripts/09-update-tickets-routing.sql
mysql -u root -p < scripts/10-add-ticket-comments.sql
```

**Atau gunakan script lengkap:**

```bash
# Windows PowerShell
Get-Content scripts/*.sql | mysql -u root -p helpdesk_nlp

# Linux/Mac
cat scripts/*.sql | mysql -u root -p helpdesk_nlp
```

### 4. Install Dependencies

```bash
npm install
# atau
pnpm install
```

### 5. Setup NLP Engine

```bash
cd nlp_api
pip install -r requirements.txt
python train_model.py
```

### 6. Run Application

**Terminal 1 - Flask NLP Service:**

```bash
cd nlp_api
python app.py
# Runs at http://localhost:8000
```

**Terminal 2 - Next.js Dev Server:**

```bash
npm run dev
# Runs at http://localhost:3000
```

## Demo Accounts

### Super Admin

- Email: `superadmin@sjpl.com`
- Password: `superadmin123`
- Access: Semua fitur, semua divisi

### Admin IT

- Email: `admin.it@sjpl.com`
- Password: `admin123`
- Division: IT
- Access: Ticket dari/ke divisi IT

### Admin HR

- Email: `admin.hr@sjpl.com`
- Password: `admin123`
- Division: HR
- Access: Ticket dari/ke divisi HR

### User ACC/FINANCE

- Email: `user.acc@sjpl.com`
- Password: `user123`
- Division: ACC/FINANCE
- Access: Ticket sendiri + ticket dari/ke divisi ACC/FINANCE

### User IT

- Email: `user.it@sjpl.com`
- Password: `user123`
- Division: IT
- Access: Ticket sendiri + ticket dari/ke divisi IT

## Struktur Project

```
sistem-helpdesk-nlp-sjpl/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── tickets/              # Ticket Management
│   │   │   ├── [id]/
│   │   │   │   ├── comments/     # Ticket comments
│   │   │   │   └── route.ts      # Ticket detail
│   │   │   ├── by-target-division/  # Division-filtered tickets
│   │   │   └── route.ts          # List & create tickets
│   │   ├── nlp/                  # NLP Classification
│   │   ├── admin/                # Admin endpoints
│   │   │   ├── notifications/
│   │   │   └── stats/
│   │   └── user/                 # User endpoints
│   │       ├── notifications/
│   │       └── profile/
│   ├── dashboard/                # User Dashboard
│   ├── admin/                    # Admin Dashboard
│   │   └── dashboard/
│   ├── super-admin/              # Super Admin Dashboard
│   │   └── dashboard/
│   ├── login/                    # Login Page
│   ├── register/                 # Register Page
│   └── page.tsx                  # Landing Page
│
├── components/                   # React Components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── dashboard-sidebar.tsx     # Multi-role sidebar
│   ├── ticket-form.tsx           # Create ticket with NLP
│   ├── ticket-list.tsx           # User's tickets
│   ├── division-ticket-list.tsx  # Division-filtered tickets
│   ├── ticket-detail-modal.tsx   # Ticket detail & response
│   ├── admin-stats.tsx           # Admin analytics
│   ├── admin-division-tickets.tsx
│   ├── admin-notifications-panel.tsx
│   ├── user-notifications-panel.tsx
│   ├── user-profile-modal.tsx
│   └── theme-provider.tsx        # Dark mode support
│
├── lib/                          # Utility Libraries
│   ├── db.ts                     # MySQL connection
│   ├── auth.ts                   # JWT utilities
│   ├── ticket-routing.ts         # Division routing logic
│   └── utils.ts                  # Helper functions
│
├── nlp_api/                      # Flask NLP Service
│   ├── app.py                    # Flask server
│   ├── train_model.py            # Model training
│   ├── requirements.txt          # Python dependencies
│   ├── utils/
│   │   ├── classifier.py         # NLP classifier
│   │   └── translator.py         # Translation service
│   ├── models/                   # Trained models
│   │   ├── vectorizer.pkl
│   │   └── model.pkl
│   └── data/                     # Training data
│       └── training_data.json
│
├── scripts/                      # Database migrations
│   ├── 01-init-database.sql
│   ├── 02-add-division-field.sql
│   ├── 03-add-nlp-fields.sql
│   ├── 04-add-target-division.sql
│   ├── 05-add-notifications-table.sql
│   ├── 06-update-notifications.sql
│   ├── 07-add-notification-reason.sql
│   ├── 08-add-category-division-mapping.sql
│   ├── 09-update-tickets-routing.sql
│   └── 10-add-ticket-comments.sql
│
├── public/                       # Static assets
│   └── uploads/                  # User uploads
│       ├── tickets/              # Ticket images
│       └── comments/             # Comment attachments
│
├── DIVISION_BASED_ROUTING.md     # Division routing documentation
├── FIXES_DIVISION_RESPONSE_SYSTEM.md  # Latest fixes documentation
└── README.md                     # This file
```

## Cara Menggunakan Sistem

### Untuk User

1. **Login** dengan akun user
2. **Dashboard** → Lihat 2 tab:
   - **"Tiket Saya"**: Ticket yang Anda buat
   - **"Tiket Divisi"**: Ticket yang ditujukan ke divisi Anda
3. **Buat Ticket**:
   - Klik "Buat Tiket Baru"
   - Isi judul & deskripsi (otomatis diprediksi kategorinya)
   - Upload foto bukti (optional)
   - Submit → NLP akan route ke divisi yang sesuai
4. **Respons Ticket**:
   - Klik ticket di tab "Tiket Divisi"
   - Klik "Lihat Detail & Tanggapi"
   - Tambah komentar, ubah status, upload foto
5. **Notifikasi**:
   - Badge merah di sidebar = ada notifikasi baru
   - Klik icon bell untuk lihat notifikasi

### Untuk Admin

1. **Login** dengan akun admin
2. **Dashboard** → Lihat statistik divisi Anda
3. **Kelola Tiket**:
   - Tab "Analytics": Statistik & grafik
   - Tab "Kelola Tiket": Semua ticket divisi Anda
   - Tab "Buat Tiket": Admin juga bisa buat ticket
4. **Respons Ticket**: Sama seperti user
5. **Filter Ticket**:
   - Filter by status (New, In Progress, Resolved)
   - Filter by source (User Divisi, Kategori NLP)

### Untuk Super Admin

1. **Login** dengan akun super admin
2. **Dashboard** → Monitor semua divisi
3. **All Tickets**: Lihat semua ticket dari semua divisi
4. **User Management**: Kelola user, admin, dan divisi
5. **Division Monitoring**: Monitor performa tiap divisi

## Division-Based Routing System

### Access Control Matrix

| Role                    | Ticket Type           | View | Respond | Change Status | Upload Photo |
| ----------------------- | --------------------- | ---- | ------- | ------------- | ------------ |
| User (pembuat)          | Own ticket            | ✅   | ✅      | ✅            | ✅           |
| User (target division)  | Ticket → divisinya    | ✅   | ✅      | ✅            | ✅           |
| User (source division)  | Ticket dari divisinya | ✅   | ✅      | ✅            | ✅           |
| User (other division)   | Unrelated ticket      | ❌   | ❌      | ❌            | ❌           |
| Admin (target division) | Ticket → divisinya    | ✅   | ✅      | ✅            | ✅           |
| Admin (source division) | Ticket dari divisinya | ✅   | ✅      | ✅            | ✅           |
| Admin (other division)  | Unrelated ticket      | ❌   | ❌      | ❌            | ❌           |
| Super Admin             | All tickets           | ✅   | ✅      | ✅            | ✅           |

### Notification Flow

```
User ACC/FINANCE membuat ticket "Laptop rusak"
           ↓
    NLP prediksi: Hardware → IT
           ↓
    Ticket disimpan dengan:
    - user_division: "ACC/FINANCE"
    - target_division: "IT"
    - nlp_category: "Hardware"
           ↓
    Notifikasi dikirim ke:
    ✅ Admin IT
    ✅ User IT (semua)
    ✅ Admin ACC/FINANCE
    ✅ Super Admin
           ↓
    Mereka semua bisa:
    - Lihat ticket detail
    - Tambah komentar/respons
    - Ubah status
    - Upload foto bukti
```

## NLP Model Performance

### Akurasi

- **Overall Accuracy**: 94.1%
- **Bilingual Support**: Indonesia & English
- **Real-time Prediction**: < 500ms latency

### Kategori dengan Confidence Score

Sistem menampilkan confidence score untuk setiap prediksi:

- High confidence (> 70%): Badge hijau
- Medium confidence (50-70%): Badge kuning
- Low confidence (< 50%): Badge merah

### Keyword-Based Classification

Model menggunakan keyword mapping untuk kategori:

- **IT Support**: hardware, software, jaringan, komputer, laptop, monitor, printer, error, bug
- **HR**: gaji, cuti, absen, karyawan, payroll, resign, salary, leave
- **ACC/FINANCE**: invoice, pembayaran, laporan keuangan, reimburse, payment, finance
- **OPERASIONAL**: fasilitas, ruangan, parkir, kebersihan, facilities, operational

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Tickets

- `GET /api/tickets` - Get tickets (role-based filtering)
- `POST /api/tickets` - Create new ticket with NLP classification
- `GET /api/tickets/by-target-division` - Get tickets for division
- `GET /api/tickets/[id]` - Get ticket detail
- `PATCH /api/tickets/[id]` - Update ticket

### Ticket Comments

- `GET /api/tickets/[id]/comments` - Get all comments
- `POST /api/tickets/[id]/comments` - Add comment/response

### Notifications

- `GET /api/admin/notifications` - Admin notifications
- `GET /api/user/notifications` - User notifications
- `PATCH /api/admin/notifications/[id]/read` - Mark as read

### NLP

- `POST /api/nlp/classify` - Classify text to category

### Admin

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management

### User

- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile

## Development

### Run Tests

```bash
npm run test
```

### Build for Production

```bash
npm run build
npm run start
```

### Lint Code

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

## Troubleshooting

### Database Connection Error

- Pastikan MySQL sudah running
- Cek `DATABASE_URL` di `.env.local`
- Jalankan migration scripts

### NLP Service Not Working

- Pastikan Flask app running di port 8000
- Cek `NLP_API_URL` di `.env.local`
- Train model dengan `python train_model.py`

### Notifikasi Tidak Muncul

- Cek tabel `notifications` dan `user_notifications` di database
- Pastikan `category_division_mapping` sudah diisi
- Cek console log untuk error

### Dark Mode Tidak Berfungsi

- Pastikan `darkMode: 'class'` ada di `tailwind.config.js`
- Refresh browser cache (Ctrl+F5)

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - See LICENSE file for details

## Credits

Developed for SJPL (Sistem Jabatan Pekerja Luar) Helpdesk System

---

**Last Updated**: January 2026

**Version**: 2.0.0 - Division-Based Routing System
