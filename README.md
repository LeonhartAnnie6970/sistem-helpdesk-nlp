# Helpdesk NLP SJPL

Sistem helpdesk otomatis berbasis web dengan klasifikasi Natural Language Processing (NLP) untuk Bahasa Indonesia dan Inggris.

## Fitur Utama

- **Klasifikasi Otomatis**: Sistem NLP secara otomatis mengklasifikasikan tiket ke kategori yang tepat
- **Bilingual Support**: Mendukung Bahasa Indonesia dan Inggris dengan translasi otomatis
- **Dashboard Analytics**: Admin dapat melihat statistik dan grafik real-time
- **User Management**: Sistem autentikasi dengan JWT dan role-based access control
- **Dark Mode**: Tema terang dan gelap yang dapat diubah

## Teknologi

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, MySQL
- **NLP Engine**: Flask, Scikit-learn, TF-IDF + Naive Bayes
- **Authentication**: JWT, bcryptjs
- **Translation**: Google Translate API

## Setup

### 1. Database Setup

```bash
mysql -u root -p < scripts/01-init-database.sql
```

### 2. Environment Variables

Copy `.env.example` ke `.env.local` dan sesuaikan:

```bash
cp .env.example .env.local
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Train NLP Model

```bash
cd nlp_api
pip install -r requirements.txt
python train_model.py
```

### 5. Run Flask NLP Engine

```bash
cd nlp_api
python app.py
```

### 6. Run Next.js Development Server

```bash
npm run dev
```

Akses aplikasi di `http://localhost:3000`

## Demo Account

- **Admin**: admin@helpdesk.com / password
- **User**: john@example.com / password

## Struktur Proyek

```
helpdesk-nlp-sjpl/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── tickets/
│   │   └── nlp/
│   ├── dashboard/
│   ├── admin/
│   ├── login/
│   ├── register/
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── ticket-form.tsx
│   ├── ticket-list.tsx
│   ├── admin-stats.tsx
│   ├── admin-tickets.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── middleware.ts
├── nlp_api/
│   ├── app.py
│   ├── train_model.py
│   ├── requirements.txt
│   └── utils/
├── scripts/
│   └── 01-init-database.sql
└── README.md
```

## Kategori Tiket

- Network
- Account
- Hardware
- Software
- Access

## Akurasi Model

Model NLP mencapai akurasi 94.1% pada dataset bilingual 500 sampel.

## Lisensi

MIT
