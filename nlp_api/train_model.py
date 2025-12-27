"""
Script to train the NLP model with sample data
Run this once to create model.pkl and vectorizer.pkl
"""

from utils.classifier_refactor import train_model
from utils.preprocess import clean_text

# Sample training data - matched to divisions
training_data = [
    # IT issues
    ("internet kantor lambat", "IT"),
    ("wifi tidak stabil", "IT"),
    ("koneksi internet putus", "IT"),
    ("jaringan down", "IT"),
    ("server tidak bisa diakses", "IT"),
    ("internet speed slow", "IT"),
    ("wifi connection problem", "IT"),
    ("network error", "IT"),
    ("tidak bisa login sistem", "IT"),
    ("password salah", "IT"),
    ("akun terkunci", "IT"),
    ("lupa password", "IT"),
    ("cannot login", "IT"),
    ("account locked", "IT"),
    ("forgot password", "IT"),
    ("printer rusak", "IT"),
    ("monitor tidak menyala", "IT"),
    ("keyboard error", "IT"),
    ("mouse tidak berfungsi", "IT"),
    ("printer broken", "IT"),
    ("monitor not working", "IT"),
    ("hardware problem", "IT"),
    ("aplikasi crash", "IT"),
    ("program error", "IT"),
    ("software bug", "IT"),
    ("aplikasi tidak bisa dibuka", "IT"),
    ("app error", "IT"),
    ("software not working", "IT"),
    ("tidak punya akses folder", "IT"),
    ("permission denied", "IT"),
    ("akses ditolak", "IT"),
    ("folder terkunci", "IT"),
    ("cannot access file", "IT"),
    ("laptop rusak", "IT"),
    ("komputer hang", "IT"),
    ("sistem error", "IT"),

    # ACC/FINANCE issues
    ("masalah pembayaran gaji", "ACC/FINANCE"),
    ("invoice belum dibayar", "ACC/FINANCE"),
    ("reimbursement terlambat", "ACC/FINANCE"),
    ("laporan keuangan salah", "ACC/FINANCE"),
    ("rekonsiliasi bank", "ACC/FINANCE"),
    ("payment not received", "ACC/FINANCE"),
    ("salary issue", "ACC/FINANCE"),
    ("budgeting problem", "ACC/FINANCE"),
    ("transaksi tidak tercatat", "ACC/FINANCE"),
    ("pencatatan keuangan error", "ACC/FINANCE"),
    ("tagihan tidak sesuai", "ACC/FINANCE"),
    ("invoice error", "ACC/FINANCE"),
    ("cash flow problem", "ACC/FINANCE"),

    # OPERASIONAL issues
    ("pengiriman barang terlambat", "OPERASIONAL"),
    ("stok barang habis", "OPERASIONAL"),
    ("gudang penuh", "OPERASIONAL"),
    ("logistics problem", "OPERASIONAL"),
    ("supply chain issue", "OPERASIONAL"),
    ("delivery delay", "OPERASIONAL"),
    ("warehouse issue", "OPERASIONAL"),
    ("inventory problem", "OPERASIONAL"),
    ("proses produksi terhambat", "OPERASIONAL"),
    ("mesin rusak", "OPERASIONAL"),
    ("quality control issue", "OPERASIONAL"),
    ("maintenance needed", "OPERASIONAL"),
    ("operational problem", "OPERASIONAL"),

    # SALES issues
    ("target penjualan tidak tercapai", "SALES"),
    ("customer complaint produk", "SALES"),
    ("promosi tidak efektif", "SALES"),
    ("sales report issue", "SALES"),
    ("pricing problem", "SALES"),
    ("discount request", "SALES"),
    ("product inquiry", "SALES"),
    ("quotation error", "SALES"),
    ("order processing issue", "SALES"),
    ("lead generation problem", "SALES"),
    ("marketing campaign issue", "SALES"),

    # CUSTOMER SERVICE issues
    ("komplain pelanggan", "CUSTOMER SERVICE"),
    ("customer tidak puas", "CUSTOMER SERVICE"),
    ("refund request", "CUSTOMER SERVICE"),
    ("return barang", "CUSTOMER SERVICE"),
    ("customer service issue", "CUSTOMER SERVICE"),
    ("complain handling", "CUSTOMER SERVICE"),
    ("pelayanan buruk", "CUSTOMER SERVICE"),
    ("respon lambat", "CUSTOMER SERVICE"),
    ("customer feedback negative", "CUSTOMER SERVICE"),
    ("after sales service", "CUSTOMER SERVICE"),
    ("warranty claim", "CUSTOMER SERVICE"),

    # HR issues
    ("masalah absensi karyawan", "HR"),
    ("cuti tidak disetujui", "HR"),
    ("recruitment process slow", "HR"),
    ("employee training needed", "HR"),
    ("performance review issue", "HR"),
    ("resignation process", "HR"),
    ("contract extension", "HR"),
    ("overtime payment", "HR"),
    ("employee benefit issue", "HR"),
    ("workplace conflict", "HR"),
    ("health insurance claim", "HR"),
    ("karyawan resign", "HR"),
    ("onboarding process", "HR"),

    # DIREKSI/DIREKTUR issues
    ("strategic planning issue", "DIREKSI/DIREKTUR"),
    ("board meeting preparation", "DIREKSI/DIREKTUR"),
    ("corporate decision needed", "DIREKSI/DIREKTUR"),
    ("laporan ke direksi", "DIREKSI/DIREKTUR"),
    ("executive approval needed", "DIREKSI/DIREKTUR"),
    ("business development issue", "DIREKSI/DIREKTUR"),
    ("company policy change", "DIREKSI/DIREKTUR"),
    ("merger and acquisition", "DIREKSI/DIREKTUR"),
    ("keputusan strategis", "DIREKSI/DIREKTUR"),
    ("rapat direksi", "DIREKSI/DIREKTUR"),
]

# Prepare data
texts = [item[0] for item in training_data]
labels = [item[1] for item in training_data]

# Clean texts
cleaned_texts = [clean_text(text) for text in texts]

# Train model
print("Training NLP model...")
model, vectorizer = train_model(cleaned_texts, labels)
print("Model trained and saved successfully!")
print(f"Total training samples: {len(texts)}")
print(f"Categories: {set(labels)}")
