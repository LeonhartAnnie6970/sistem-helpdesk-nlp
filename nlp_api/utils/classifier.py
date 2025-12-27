"""
Keyword-based Classifier untuk Ticket System - Updated Divisions
Support Bahasa Indonesia & Inggris
Divisi: IT, ACC/FINANCE, OPERASIONAL, SALES, CUSTOMER SERVICE, HR, DIREKSI/DIREKTUR
"""

import re
from typing import Dict, List, Tuple

class KeywordClassifier:
    def __init__(self):
        self.categories = {
            'IT': {
                'keywords': [
                    # Network & Internet
                    'internet', 'network', 'jaringan', 'wifi', 'wi-fi',
                    'koneksi', 'connection', 'connect', 'konek',
                    'vpn', 'bandwidth', 'server', 'dns', 'ip',
                    'lan', 'wan', 'router', 'modem',
                    'lemot', 'slow', 'lambat', 'lag',
                    # Hardware
                    'komputer', 'computer', 'laptop', 'pc', 'desktop',
                    'hardware', 'mouse', 'keyboard', 'monitor', 'layar', 'display', 'screen',
                    'cpu', 'ram', 'hardisk', 'ssd', 'printer', 'scanner',
                    'rusak', 'broken', 'error', 'tidak berfungsi', 'mati', 'tidak nyala',
                    # Software
                    'software', 'aplikasi', 'application', 'app', 'program',
                    'sistem', 'system', 'windows', 'linux', 'mac',
                    'install', 'instalasi', 'update', 'upgrade', 'patch',
                    # Errors
                    'error', 'bug', 'crash', 'hang', 'freeze', 'restart',
                    'blue screen', 'bsod', 'not responding', 'tidak merespon',
                    # Email & Access
                    'email', 'outlook', 'gmail', 'mail',
                    'password', 'kata sandi', 'login', 'akses', 'access',
                    'account', 'akun', 'username', 'terkunci', 'locked',
                    'lupa password', 'forgot password', 'reset password',
                    # Database
                    'database', 'db', 'sql', 'data', 'backup', 'restore',
                    # Permission
                    'permission', 'denied', 'ditolak', 'folder', 'file'
                ],
                'weight': 1.0
            },

            'ACC/FINANCE': {
                'keywords': [
                    # Payment
                    'pembayaran', 'bayar', 'dibayar', 'membayar', 'payment', 'pay', 'paid',
                    # Bills & Invoices
                    'tagihan', 'bill', 'invoice', 'faktur',
                    # Reimbursement
                    'reimbursement', 'reimburse', 'reimburs', 'klaim', 'claim',
                    # Transfer & Money
                    'transfer', 'dana', 'uang', 'money', 'cash', 'tunai',
                    # Finance terms
                    'keuangan', 'finance', 'financial', 'budget', 'anggaran',
                    'biaya', 'cost', 'expense', 'pengeluaran',
                    'hutang', 'debt', 'piutang', 'receivable',
                    'accounting', 'akuntansi', 'akunting',
                    # Transactions
                    'transaksi', 'transaction', 'refund', 'pengembalian',
                    # Bonus & Incentive
                    'bonus', 'insentif', 'incentive', 'komisi', 'commission',
                    # Banking
                    'bank', 'rekening', 'rekonsiliasi', 'reconciliation',
                    # Report
                    'laporan keuangan', 'financial report', 'cash flow'
                ],
                'weight': 1.0
            },

            'OPERASIONAL': {
                'keywords': [
                    # Logistics & Shipping
                    'pengiriman', 'delivery', 'kirim', 'ship', 'shipping',
                    'barang', 'goods', 'cargo', 'paket', 'package',
                    'terlambat', 'delay', 'late', 'telat',
                    # Inventory
                    'stok', 'stock', 'inventory', 'persediaan',
                    'gudang', 'warehouse', 'storage',
                    'habis', 'out of stock', 'kosong', 'empty',
                    # Supply Chain
                    'supply chain', 'logistik', 'logistics',
                    'vendor', 'supplier', 'pemasok',
                    'procurement', 'pengadaan',
                    # Production
                    'produksi', 'production', 'manufacture',
                    'mesin', 'machine', 'equipment', 'peralatan',
                    'maintenance', 'pemeliharaan', 'perbaikan',
                    # Quality
                    'quality', 'kualitas', 'quality control', 'qc',
                    'defect', 'cacat', 'reject', 'retur',
                    # Operations
                    'operasional', 'operational', 'operation',
                    'proses', 'process', 'workflow',
                    # Facility (moved to Operational)
                    'ruangan', 'room', 'parkir', 'parking',
                    'ac', 'air conditioner', 'lift', 'elevator'
                ],
                'weight': 1.0
            },

            'SALES': {
                'keywords': [
                    # Sales
                    'penjualan', 'sales', 'sell', 'jual',
                    'target', 'quota', 'kuota',
                    'deal', 'closing', 'close',
                    # Marketing
                    'marketing', 'promosi', 'promotion', 'promo',
                    'campaign', 'kampanye', 'iklan', 'advertising',
                    'branding', 'brand',
                    # Customer Acquisition
                    'lead', 'prospek', 'prospect',
                    'customer', 'pelanggan', 'klien', 'client',
                    'order', 'pesanan', 'purchase',
                    # Pricing
                    'harga', 'price', 'pricing',
                    'diskon', 'discount', 'potongan',
                    'quotation', 'penawaran', 'quote',
                    # Products
                    'produk', 'product', 'barang',
                    'katalog', 'catalog',
                    # Performance
                    'sales report', 'laporan penjualan',
                    'revenue', 'pendapatan', 'omzet',
                    # B2B/B2C
                    'distributor', 'reseller', 'retailer'
                ],
                'weight': 1.0
            },

            'CUSTOMER SERVICE': {
                'keywords': [
                    # Complaints
                    'komplain', 'complaint', 'keluhan', 'complain',
                    'tidak puas', 'dissatisfied', 'kecewa',
                    # Customer Service
                    'customer service', 'layanan pelanggan', 'cs',
                    'pelayanan', 'service', 'dukungan', 'support', 'claim',
                    'klaim'
                    # Returns & Refunds
                    'return', 'retur', 'pengembalian',
                    'refund', 'uang kembali',
                    'tukar', 'exchange', 'ganti',
                    # Response
                    'respon', 'response', 'lambat', 'slow',
                    'tidak ada jawaban', 'no response',
                    # Customer Issues
                    'pelanggan marah', 'angry customer',
                    'customer feedback', 'feedback pelanggan',
                    'testimoni', 'testimonial', 'review',
                    # After Sales
                    'after sales', 'purna jual',
                    'garansi', 'warranty', 'claim garansi',
                    # Handling
                    'handle', 'menangani', 'penanganan'
                ],
                'weight': 1.0
            },

            'HR': {
                'keywords': [
                    # Leave & Attendance
                    'cuti', 'leave', 'izin', 'sakit', 'sick',
                    'absen', 'absensi', 'attendance', 'hadir', 'kehadiran',
                    'alpha', 'mangkir', 'terlambat', 'late', 'telat',
                    'lembur', 'overtime', 'ot', 'shift',
                    # Employment
                    'kontrak', 'contract', 'perjanjian kerja',
                    'resign', 'pengunduran diri', 'berhenti', 'keluar',
                    'recruitment', 'rekrutmen', 'hiring', 'perekrutan',
                    'karyawan', 'employee', 'staff', 'pegawai', 'pekerja',
                    'training', 'pelatihan', 'workshop', 'seminar',
                    'onboarding', 'orientasi',
                    # Career
                    'promosi', 'promotion', 'kenaikan jabatan',
                    'mutasi', 'rotasi', 'rotation',
                    'penilaian', 'evaluation', 'performance', 'kinerja',
                    'appraisal', 'performance review',
                    # Benefits
                    'tunjangan', 'allowance', 'benefit',
                    'asuransi', 'insurance', 'bpjs', 'jaminan',
                    'kesehatan', 'health', 'medical',
                    # Salary & Payroll
                    'gaji', 'salary', 'slip gaji', 'payslip', 'pay slip',
                    'upah', 'wage', 'pembayaran gaji', 'salary payment', 'payroll',
                    'take home pay', 'thp', 'gaji bersih', 'net salary',
                    'potongan gaji', 'salary deduction', 'penggajian',
                    # HR Admin
                    'hr', 'human resources', 'sdm', 'sumber daya manusia',
                    # Workplace
                    'konflik', 'conflict', 'masalah karyawan'
                ],
                'weight': 1.0
            },

            'DIREKSI/DIREKTUR': {
                'keywords': [
                    # Strategic
                    'strategi', 'strategic', 'strategy',
                    'planning', 'perencanaan', 'rencana',
                    'bisnis', 'business', 'development',
                    # Executive
                    'direksi', 'direktur', 'director', 'executive',
                    'board', 'dewan', 'komisaris',
                    'ceo', 'cfo', 'coo', 'cto',
                    # Meetings
                    'rapat direksi', 'board meeting',
                    'rapat pimpinan', 'management meeting',
                    # Decisions
                    'keputusan', 'decision', 'approval',
                    'persetujuan', 'otorisasi', 'authorization',
                    # Corporate
                    'korporat', 'corporate', 'perusahaan', 'company',
                    'merger', 'akuisisi', 'acquisition',
                    'ekspansi', 'expansion',
                    # Policy
                    'kebijakan', 'policy', 'peraturan',
                    'regulasi', 'regulation',
                    # Reporting
                    'laporan ke direksi', 'executive report',
                    'presentasi direksi', 'board presentation',
                    # Investment
                    'investasi', 'investment', 'modal', 'capital'
                ],
                'weight': 1.0
            },

            'General': {
                'keywords': [
                    'lainnya', 'other', 'umum', 'general',
                    'pertanyaan', 'question', 'tanya',
                    'informasi', 'information', 'info',
                    'bantuan', 'help', 'support'
                ],
                'weight': 0.3
            }
        }

    def preprocess_text(self, text: str) -> str:
        """Normalize text"""
        text = text.lower()
        text = ' '.join(text.split())
        text = re.sub(r'[^a-z0-9\s/-]', ' ', text)
        text = ' '.join(text.split())
        return text

    def calculate_score(self, text: str, keywords: List[str], weight: float) -> Tuple[float, List[str]]:
        """Calculate score for category"""
        processed_text = self.preprocess_text(text)
        words = set(processed_text.split())

        score = 0.0
        matched = []

        for keyword in keywords:
            keyword_processed = self.preprocess_text(keyword)
            keyword_words = keyword_processed.split()

            # Multi-word keyword (higher score)
            if len(keyword_words) > 1:
                if keyword_processed in processed_text:
                    score += 3.0 * weight
                    matched.append(keyword)
            # Single word keyword
            else:
                if keyword_processed in words:
                    score += 2.0 * weight
                    matched.append(keyword)
                elif any(keyword_processed in word for word in words):
                    score += 1.0 * weight
                    matched.append(f"~{keyword}")

        return score, list(set(matched))

    def classify(self, text: str) -> Dict:
        """Main classification"""
        if not text or not text.strip():
            return {
                'category': 'General',
                'confidence': 0.0,
                'matched_keywords': [],
                'all_scores': {},
                'method': 'empty_input'
            }

        results = {}

        for category, config in self.categories.items():
            score, matched = self.calculate_score(
                text,
                config['keywords'],
                config.get('weight', 1.0)
            )
            results[category] = {
                'score': score,
                'matched': matched
            }

        best_category = max(results.keys(), key=lambda k: results[k]['score'])
        best_score = results[best_category]['score']

        # If no match found, return General
        if best_score == 0:
            return {
                'category': 'General',
                'confidence': 0.0,
                'matched_keywords': [],
                'all_scores': {k: v['score'] for k, v in results.items()},
                'method': 'no_match_found'
            }

        # Calculate confidence (max 1.0)
        confidence = min(best_score / 10.0, 1.0)

        return {
            'category': best_category,
            'confidence': round(confidence, 2),
            'matched_keywords': results[best_category]['matched'],
            'all_scores': {k: round(v['score'], 2) for k, v in results.items()},
            'method': 'keyword_matching'
        }

    def get_suggestions(self, text: str, limit: int = 3) -> List[Dict]:
        """Get top N category suggestions"""
        result = self.classify(text)
        suggestions = []

        for category, score in result['all_scores'].items():
            if score > 0:
                suggestions.append({
                    'category': category,
                    'score': score,
                    'confidence': round(min(score / 10.0, 1.0), 2)
                })

        suggestions.sort(key=lambda x: x['score'], reverse=True)
        return suggestions[:limit] if limit else suggestions
