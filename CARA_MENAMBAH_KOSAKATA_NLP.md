# 📚 Cara Menambahkan Kosakata NLP

Ada 2 cara menambahkan kosakata ke sistem NLP Anda:

---

## 1️⃣ **Keyword-Based Classifier** (Instant, Tidak Perlu Training)

File: `nlp_api/utils/classifier.py`

### Cara Menambahkan Keywords:

Buka file `classifier.py` dan tambahkan kata kunci di array `keywords` untuk divisi yang sesuai:

```python
'IT': {
    'keywords': [
        # Network & Internet
        'internet', 'network', 'jaringan', 'wifi', 'wi-fi',

        # TAMBAHKAN KEYWORDS BARU DI SINI
        'firewall', 'switch', 'access point', 'kabel lan',
        'internet mati', 'tidak bisa browsing', 'google tidak bisa dibuka',

        # Hardware
        'komputer', 'computer', 'laptop', 'pc', 'desktop',

        # ATAU TAMBAHKAN DI SINI
        'scanner', 'webcam', 'headset', 'microphone',
        'layar mati', 'tidak bisa nyala', 'battery habis',
    ],
    'weight': 1.5
},
```

### Contoh Lengkap - Menambah Keywords untuk IT:

```python
'IT': {
    'keywords': [
        # Network & Internet (EXISTING + NEW)
        'internet', 'network', 'jaringan', 'wifi', 'wi-fi',
        'koneksi', 'connection', 'connect', 'konek',
        'vpn', 'bandwidth', 'server', 'dns', 'ip',
        'lan', 'wan', 'router', 'modem',
        'lemot', 'slow', 'lambat', 'lag',

        # ✨ KEYWORDS BARU - Network
        'firewall', 'switch', 'access point', 'ap',
        'kabel lan', 'network cable', 'ethernet',
        'internet mati', 'tidak bisa internetan', 'google tidak bisa dibuka',
        'cannot connect', 'connection timeout', 'dns error',
        'website tidak bisa dibuka', 'loading terus', 'buffering',

        # Hardware (EXISTING)
        'komputer', 'computer', 'laptop', 'pc', 'desktop',
        'hardware', 'mouse', 'keyboard', 'monitor',
        'cpu', 'ram', 'hardisk', 'ssd', 'printer',
        'rusak', 'broken', 'error', 'tidak berfungsi',

        # ✨ KEYWORDS BARU - Hardware
        'scanner', 'webcam', 'kamera', 'camera',
        'headset', 'speaker', 'microphone', 'mic',
        'charger', 'adaptor', 'power supply', 'psu',
        'layar mati', 'monitor blank', 'black screen',
        'tidak bisa nyala', 'mati total', 'tidak hidup',
        'battery habis', 'baterai bocor', 'cepat habis',
        'tombol rusak', 'keyboard tidak berfungsi',
        'touchpad error', 'mouse tidak gerak',

        # Software (EXISTING)
        'software', 'aplikasi', 'application', 'app', 'program',
        'sistem', 'system', 'windows', 'linux', 'mac',
        'install', 'instalasi', 'update', 'upgrade', 'patch',

        # ✨ KEYWORDS BARU - Software
        'antivirus', 'microsoft office', 'excel', 'word', 'powerpoint',
        'chrome', 'firefox', 'browser', 'zoom', 'teams',
        'whatsapp', 'telegram', 'aplikasi chat',
        'tidak bisa install', 'gagal update', 'error saat install',
        'aplikasi crash', 'aplikasi lemot', 'not responding',
        'lisensi expire', 'trial habis', 'aktivasi gagal',
    ],
    'weight': 1.5
},
```

### Tips Menambahkan Keywords:

1. **Gunakan Bahasa Indonesia DAN Inggris**
   ```python
   'pembayaran', 'payment',  # Kedua bahasa
   'gaji belum masuk', 'salary not received',
   ```

2. **Gunakan Frasa Multi-Kata** (lebih akurat, score lebih tinggi)
   ```python
   'internet kantor lambat',  # Lebih spesifik
   'password lupa',           # Frasa
   'printer tidak bisa print',
   ```

3. **Gunakan Variasi Kata**
   ```python
   'lemot', 'lambat', 'slow', 'lag',  # Variasi untuk "lambat"
   'rusak', 'broken', 'error', 'tidak berfungsi',  # Variasi "rusak"
   ```

4. **Tambahkan Istilah Spesifik Perusahaan Anda**
   ```python
   'sap', 'erp system', 'crm',  # Sistem yang digunakan
   'zoom meeting', 'google workspace',
   ```

---

## 2️⃣ **Machine Learning Model** (Perlu Training Ulang)

File: `nlp_api/train_model.py`

### Cara Menambahkan Training Data:

Buka file `train_model.py` dan tambahkan contoh kalimat:

```python
training_data = [
    # IT issues (EXISTING)
    ("internet kantor lambat", "IT"),
    ("wifi tidak stabil", "IT"),
    ("koneksi internet putus", "IT"),

    # ✨ TAMBAHKAN TRAINING DATA BARU
    ("firewall block aplikasi saya", "IT"),
    ("switch rusak tidak bisa konek", "IT"),
    ("kabel lan putus", "IT"),
    ("google tidak bisa dibuka", "IT"),
    ("website loading terus", "IT"),
    ("printer tidak bisa print", "IT"),
    ("scanner error tidak bisa scan", "IT"),
    ("webcam tidak terdeteksi", "IT"),
    ("headset suara tidak keluar", "IT"),
    ("charger laptop rusak", "IT"),
    ("layar laptop mati", "IT"),
    ("battery cepat habis", "IT"),
    ("keyboard huruf a tidak berfungsi", "IT"),
    ("touchpad tidak bisa klik", "IT"),
    ("aplikasi zoom tidak bisa dibuka", "IT"),
    ("microsoft excel crash terus", "IT"),
    ("antivirus tidak bisa update", "IT"),
    ("lisensi office expire", "IT"),

    # ACC/FINANCE issues (EXISTING)
    ("masalah pembayaran gaji", "ACC/FINANCE"),
    ("invoice belum dibayar", "ACC/FINANCE"),

    # ✨ TAMBAHKAN TRAINING DATA BARU
    ("reimbursement belum cair", "ACC/FINANCE"),
    ("slip gaji salah", "ACC/FINANCE"),
    ("transfer gaji telat", "ACC/FINANCE"),
    ("tagihan vendor belum dibayar", "ACC/FINANCE"),
    ("budget departemen kurang", "ACC/FINANCE"),
    ("laporan keuangan tidak sesuai", "ACC/FINANCE"),
    ("biaya perjalanan dinas belum dikembalikan", "ACC/FINANCE"),
    ("bonus belum masuk rekening", "ACC/FINANCE"),

    # Dan seterusnya untuk divisi lain...
]
```

### Setelah Menambahkan Training Data:

**WAJIB Retrain Model:**

```bash
cd nlp_api

# Opsi 1: Mudah (Windows)
retrain_model.bat

# Opsi 2: Manual
.venv\Scripts\activate
python train_model.py
```

**Kemudian Restart Server:**

```bash
python app_refactor.py
```

---

## 📊 Perbandingan Kedua Metode

| Aspek | Keyword Classifier | ML Model |
|-------|-------------------|----------|
| **Kecepatan Update** | Instant, edit langsung | Perlu retrain (~5-10 menit) |
| **Restart Required** | ❌ Tidak (reload otomatis) | ✅ Ya, restart server |
| **Akurasi** | Baik untuk exact match | Lebih baik, bisa pahami konteks |
| **Fleksibilitas** | Hanya kata yang didefinisikan | Bisa deteksi kata mirip/sinonim |
| **Cocok untuk** | Istilah spesifik perusahaan | Kalimat kompleks/bervariasi |

---

## 🎯 **Rekomendasi Best Practice**

### 1. **Update Keduanya untuk Akurasi Maksimal**

Sistem menggunakan HYBRID approach - keyword classifier dan ML model bekerja bersamaan.

**Workflow:**
1. Tambahkan keywords di `classifier.py` (untuk instant detection)
2. Tambahkan training data di `train_model.py` (untuk ML learning)
3. Retrain model
4. Restart server

### 2. **Berapa Banyak Training Data yang Ideal?**

**Minimum:** 15-20 contoh per divisi
**Recommended:** 50-100 contoh per divisi
**Optimal:** 200+ contoh per divisi

Saat ini Anda punya:
- IT: 37 samples
- ACC/FINANCE: 13 samples
- OPERASIONAL: 13 samples
- SALES: 12 samples
- CUSTOMER SERVICE: 10 samples
- HR: 12 samples
- DIREKSI/DIREKTUR: 11 samples

**Total: 108 samples** - ini sudah cukup untuk start, tapi lebih banyak = lebih baik!

### 3. **Gunakan Data Ticket Real**

Cara terbaik: Gunakan ticket real dari sistem Anda!

**Query MySQL untuk mendapatkan data:**

```sql
SELECT title, description, category
FROM tickets
WHERE category IS NOT NULL
LIMIT 500;
```

Lalu tambahkan ke `train_model.py`:

```python
# Data dari ticket real
("email tidak bisa kirim attachment besar", "IT"),
("pembayaran supplier bulan november belum transfer", "ACC/FINANCE"),
("pengiriman ke jakarta selalu telat", "OPERASIONAL"),
```

### 4. **Testing Setelah Menambah Kosakata**

Test dengan POST request:

```bash
POST http://localhost:8000/classify
Content-Type: application/json

{
  "text": "firewall block aplikasi zoom saya"
}
```

Expected:
```json
{
  "target_division": "IT",
  "confidence": 0.95,
  "keywords": ["firewall", "aplikasi", "zoom"]
}
```

---

## 🔧 Contoh Lengkap: Menambah 50 Keywords untuk ACC/FINANCE

### Edit `classifier.py`:

```python
'ACC/FINANCE': {
    'keywords': [
        # Payment (EXISTING)
        'pembayaran', 'bayar', 'dibayar', 'membayar', 'payment', 'pay', 'paid',

        # ✨ KEYWORDS BARU - Payment
        'lunas', 'settled', 'pelunasan', 'cicilan', 'installment',
        'dp', 'down payment', 'uang muka', 'termin',
        'pembayaran tertunda', 'payment pending', 'overdue',
        'jatuh tempo', 'due date', 'deadline pembayaran',

        # Salary & Payroll (EXISTING)
        'gaji', 'salary', 'upah', 'wage', 'payroll', 'slip gaji',

        # ✨ KEYWORDS BARU - Salary
        'take home pay', 'gaji bersih', 'gaji kotor', 'gross salary',
        'potongan gaji', 'deduction', 'pajak', 'tax', 'pph21',
        'gaji prorate', 'gaji proporsional',
        'gaji telat', 'salary delay', 'belum transfer',

        # Bills & Invoices (EXISTING)
        'tagihan', 'bill', 'invoice', 'faktur',

        # ✨ KEYWORDS BARU - Invoices
        'faktur pajak', 'tax invoice', 'nota', 'receipt', 'kwitansi',
        'invoice belum dibayar', 'outstanding invoice',
        'nomor invoice', 'invoice number',
        'proforma invoice', 'down payment invoice',

        # Reimbursement (EXISTING)
        'reimbursement', 'reimburse', 'reimburs', 'klaim', 'claim',

        # ✨ KEYWORDS BARU - Reimbursement
        'reimburse belum cair', 'reimbursement pending',
        'biaya perjalanan dinas', 'travel expense',
        'biaya transport', 'uang bensin', 'fuel reimbursement',
        'reimburse kesehatan', 'medical claim',
        'bukti pembayaran', 'proof of payment', 'struk',

        # Transfer & Money (EXISTING)
        'transfer', 'dana', 'uang', 'money', 'cash', 'tunai',

        # ✨ KEYWORDS BARU - Transfer
        'transfer gagal', 'failed transfer', 'transfer pending',
        'bukti transfer', 'proof of transfer',
        'nomor rekening salah', 'wrong account number',
        'transfer antar bank', 'interbank transfer',

        # Finance terms (EXISTING)
        'keuangan', 'finance', 'financial', 'budget', 'anggaran',
        'biaya', 'cost', 'expense', 'pengeluaran',
        'hutang', 'debt', 'piutang', 'receivable',
        'accounting', 'akuntansi', 'akunting',

        # ✨ KEYWORDS BARU - Finance
        'neraca', 'balance sheet', 'laba rugi', 'profit loss',
        'cashflow', 'arus kas', 'petty cash', 'kas kecil',
        'jurnal', 'journal entry', 'buku besar', 'ledger',
        'closing', 'tutup buku', 'audit', 'auditor',
        'pajak pph', 'ppn', 'vat', 'withholding tax',

        # Transactions (EXISTING)
        'transaksi', 'transaction', 'refund', 'pengembalian',

        # ✨ KEYWORDS BARU - Transactions
        'void transaction', 'cancel transaction', 'batal transaksi',
        'dispute', 'chargeback', 'reversal',

        # Bonus & Incentive (EXISTING)
        'bonus', 'insentif', 'incentive', 'komisi', 'commission',

        # ✨ KEYWORDS BARU - Bonus
        'thr', 'tunjangan hari raya', 'bonus tahunan', 'annual bonus',
        'bonus kinerja', 'performance bonus',

        # Banking (EXISTING)
        'bank', 'rekening', 'rekonsiliasi', 'reconciliation',

        # ✨ KEYWORDS BARU - Banking
        'bca', 'mandiri', 'bni', 'bri',  # Nama bank populer
        'internet banking', 'mobile banking', 'm-banking',
        'atm', 'debit card', 'kartu debit',

        # Report (EXISTING)
        'laporan keuangan', 'financial report', 'cash flow'

        # ✨ KEYWORDS BARU - Report
        'monthly report', 'laporan bulanan',
        'quarterly report', 'laporan kuartalan',
        'budget variance', 'selisih anggaran',
    ],
    'weight': 1.5
},
```

---

## 📝 Checklist Setelah Menambah Kosakata

- [ ] Edit `classifier.py` - tambah keywords
- [ ] Edit `train_model.py` - tambah training samples
- [ ] Jalankan `retrain_model.bat` atau `python train_model.py`
- [ ] Restart server: `python app_refactor.py`
- [ ] Test dengan beberapa contoh kalimat
- [ ] Monitor akurasi selama 1-2 minggu
- [ ] Tambahkan lagi keywords berdasarkan ticket yang salah kategori

---

## 🆘 Troubleshooting

### "Keywords banyak tapi akurasi tetap rendah"
- Pastikan keywords relevan dengan divisi
- Periksa weight divisi (1.0 - 1.5)
- Tambahkan lebih banyak training data

### "Model tetap prediksi ke General"
- Keywords terlalu umum (contoh: 'help', 'bantuan')
- Gunakan keywords lebih spesifik
- Tambahkan multi-word phrases

### "Beberapa ticket masuk ke divisi yang salah"
- Analisis keywords yang match
- Kurangi keyword yang ambiguous
- Tambahkan negative keywords jika perlu

---

**Update Date**: 27 Desember 2024
**Version**: 1.0
