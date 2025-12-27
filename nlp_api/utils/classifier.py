# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.naive_bayes import MultinomialNB
# import joblib
# import os

# MODEL_PATH = 'model.pkl'
# VECTORIZER_PATH = 'vectorizer.pkl'


# def load_model():
#     """Load pre-trained model and vectorizer"""
#     if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
#         model = joblib.load(MODEL_PATH)
#         vectorizer = joblib.load(VECTORIZER_PATH)
#         return model, vectorizer
#     return None, None


# def train_model(texts, labels):
#     """Train NLP model with TF-IDF + Naive Bayes"""
#     vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
#     X = vectorizer.fit_transform(texts)
    
#     model = MultinomialNB()
#     model.fit(X, labels)
    
#     # Save model and vectorizer
#     joblib.dump(model, MODEL_PATH)
#     joblib.dump(vectorizer, VECTORIZER_PATH)
    
#     return model, vectorizer


# def classify_text(text, model, vectorizer):
#     """Classify text using trained model"""
#     if not model or not vectorizer:
#         return None
    
#     X = vectorizer.transform([text])
#     prediction = model.predict(X)[0]
#     confidence = model.predict_proba(X).max()
    
#     return {
#         'category': prediction,
#         'confidence': float(confidence)
#     }

"""
Keyword-based Classifier untuk Ticket System
Support Bahasa Indonesia & Inggris
"""

import re
from typing import Dict, List, Tuple

class KeywordClassifier:
    def __init__(self):
        self.categories = {
            'Finance': {
                'keywords': [
                    # Payment
                    'pembayaran', 'bayar', 'dibayar', 'membayar', 'payment', 'pay', 'paid',
                    # Salary
                    'gaji', 'salary', 'upah', 'wage',
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
                    # Transactions
                    'transaksi', 'transaction', 'refund', 'pengembalian',
                    # Bonus & Incentive
                    'bonus', 'insentif', 'incentive', 'komisi', 'commission'
                ],
                'weight': 1.5
            },
            
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
                    'hardware', 'mouse', 'keyboard', 'monitor',
                    'cpu', 'ram', 'hardisk', 'ssd',
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
                    'account', 'akun', 'username',
                    # Database
                    'database', 'db', 'sql', 'data', 'backup', 'restore'
                ],
                'weight': 1.2
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
                    # Career
                    'promosi', 'promotion', 'kenaikan jabatan',
                    'mutasi', 'rotasi', 'rotation',
                    'penilaian', 'evaluation', 'performance', 'kinerja',
                    # Benefits
                    'tunjangan', 'allowance', 'benefit',
                    'asuransi', 'insurance', 'bpjs', 'jaminan',
                    'kesehatan', 'health', 'medical',
                    # Payroll
                    'payroll', 'slip gaji', 'salary slip'
                ],
                'weight': 1.3
            },
            
            'Facility': {
                'keywords': [
                    # Rooms
                    'ruangan', 'room', 'ruang', 'space',
                    'meeting', 'rapat', 'conference', 'konferensi',
                    'kantor', 'office',
                    'parkir', 'parking',
                    'toilet', 'wc', 'kamar mandi', 'restroom',
                    'pantry', 'dapur', 'kitchen',
                    'lobby', 'reception',
                    # HVAC
                    'ac', 'air conditioner', 'pendingin',
                    'panas', 'hot', 'dingin', 'cold',
                    'ventilasi', 'ventilation',
                    # Building
                    'lift', 'elevator', 'tangga', 'stairs',
                    'lampu', 'light', 'lighting',
                    'pintu', 'door', 'jendela', 'window',
                    'kunci', 'key', 'lock',
                    # Maintenance
                    'perbaikan', 'repair', 'maintenance',
                    'rusak', 'broken', 'damaged', 'bocor', 'leak',
                    'cleaning', 'kebersihan', 'bersih', 'kotor',
                    # Furniture
                    'meja', 'table', 'kursi', 'chair',
                    'lemari', 'cabinet'
                ],
                'weight': 1.0
            },
            
            'Admin': {
                'keywords': [
                    # Documents
                    'surat', 'letter', 'dokumen', 'document',
                    'arsip', 'archive', 'berkas',
                    'formulir', 'form',
                    'legalisir', 'legalisasi',
                    'sertifikat', 'certificate',
                    # Office Supplies
                    'printer', 'print', 'cetak',
                    'fotocopy', 'photocopy', 'copy',
                    'scan', 'scanner',
                    'kertas', 'paper',
                    'atk', 'stationery', 'alat tulis',
                    'tinta', 'ink', 'toner',
                    'pulpen', 'pen', 'pensil',
                    # Admin
                    'administrasi', 'administration',
                    'perizinan', 'permit'
                ],
                'weight': 1.0
            },
            
            'Security': {
                'keywords': [
                    # Security
                    'keamanan', 'security', 'satpam', 'guard',
                    # Access
                    'kartu', 'card', 'badge', 'id card',
                    'akses masuk', 'entry', 'exit',
                    'pintu masuk', 'entrance', 'gerbang',
                    # Surveillance
                    'cctv', 'camera', 'kamera',
                    # Incidents
                    'kehilangan', 'lost', 'hilang',
                    'pencurian', 'theft', 'dicuri',
                    'mencurigakan', 'suspicious',
                    'darurat', 'emergency'
                ],
                'weight': 1.1
            },
            
            'General': {
                'keywords': [
                    'lainnya', 'other', 'umum', 'general',
                    'pertanyaan', 'question', 'tanya',
                    'informasi', 'information', 'info',
                    'bantuan', 'help', 'support'
                ],
                'weight': 0.5
            }
        }
    
    def preprocess_text(self, text: str) -> str:
        """Normalize text"""
        text = text.lower()
        text = ' '.join(text.split())
        text = re.sub(r'[^a-z0-9\s-]', ' ', text)
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
            
            if len(keyword_words) > 1:
                if keyword_processed in processed_text:
                    score += 3.0 * weight
                    matched.append(keyword)
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
        
        if best_score == 0:
            return {
                'category': 'General',
                'confidence': 0.0,
                'matched_keywords': [],
                'all_scores': {k: v['score'] for k, v in results.items()},
                'method': 'no_match_found'
            }
        
        confidence = min(best_score / 10.0, 1.0)
        
        return {
            'category': best_category,
            'confidence': round(confidence, 2),
            'matched_keywords': results[best_category]['matched'],
            'all_scores': {k: round(v['score'], 2) for k, v in results.items()},
            'method': 'keyword_matching'
        }
    
    def get_suggestions(self, text: str, limit: int = 3) -> List[Dict]:
        """Get top suggestions"""
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