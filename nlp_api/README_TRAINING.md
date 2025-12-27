# NLP Model Training - Divisi Baru

## ⚠️ PENTING: Model Harus Di-Retrain!

Kategori NLP telah diubah dari kategori lama (Network, Account, Hardware, Software, Access) menjadi divisi baru yang sesuai dengan sistem.

## Perubahan Divisi

Divisi telah diupdate menjadi:
1. **IT** - Information Technology (jaringan, hardware, software, akun, sistem)
2. **ACC/FINANCE** - Accounting & Finance (keuangan, pembayaran, invoice, gaji)
3. **OPERASIONAL** - Operasional (logistik, produksi, gudang, supply chain)
4. **SALES** - Sales & Marketing (penjualan, promosi, marketing)
5. **CUSTOMER SERVICE** - Customer Service (komplain, layanan pelanggan)
6. **HR** - Human Resources (SDM, karyawan, cuti, rekrutmen)
7. **DIREKSI/DIREKTUR** - Direksi & Direktur (strategi, keputusan eksekutif)

## 🚀 Cara MUDAH - Gunakan Batch File (Windows)

### Opsi 1: Double Click File Batch
1. Buka folder `nlp_api`
2. Double-click file `retrain_model.bat`
3. Tunggu sampai training selesai
4. Restart NLP API server

### Opsi 2: Manual Training

#### 1. Hapus Model Lama (WAJIB!)

```bash
cd nlp_api
del model.pkl vectorizer.pkl
# Atau di Linux/Mac: rm model.pkl vectorizer.pkl
```

#### 2. Aktivasi Virtual Environment

```bash
.venv\Scripts\activate  # Windows
# atau
source .venv/bin/activate  # Linux/Mac
```

#### 3. Install Dependencies (jika belum)

```bash
pip install -r requirements.txt
```

#### 4. Jalankan Training Script

```bash
python train_model.py
```

### 4. Verifikasi Model

Setelah training selesai, akan ada 2 file baru:
- `model.pkl` - Model machine learning yang sudah ditraining
- `vectorizer.pkl` - TF-IDF vectorizer

### 5. Restart NLP API Server

```bash
# Stop server yang sedang berjalan (Ctrl+C)
# Start ulang server
python app_refactor.py
```

## Testing Model

Anda bisa test model dengan mengirim request ke API:

```bash
POST http://localhost:5000/classify
Content-Type: application/json

{
  "text": "internet kantor lambat"
}
```

Expected response:
```json
{
  "category": "IT",
  "confidence": 0.95
}
```

## Training Data

File `train_model.py` sudah berisi training data untuk 7 divisi baru dengan contoh kalimat untuk setiap kategori. Anda bisa menambah lebih banyak training data untuk meningkatkan akurasi model.

## Update Database

Jangan lupa jalankan SQL script untuk update mapping divisi:

```bash
mysql -u root -p helpdesk_nlp < scripts/09-update-divisions-mapping.sql
```

## Troubleshooting

### Error: ModuleNotFoundError
Pastikan virtual environment sudah diaktivasi dan semua dependencies terinstall.

### Model accuracy rendah
Tambahkan lebih banyak training data di `train_model.py` untuk kategori yang akurasinya rendah.

### API tidak bisa klasifikasi
Pastikan `model.pkl` dan `vectorizer.pkl` ada di folder `nlp_api` dan server sudah direstart.
