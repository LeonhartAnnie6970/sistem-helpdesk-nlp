type CategoryConfig = {
  keywords: string[]
  weight: number
}

export type ClassifyResult = {
  category: string
  confidence: number
  matched_keywords: string[]
  all_scores: Record<string, number>
  method: string
}

const CATEGORIES: Record<string, CategoryConfig> = {
  IT: {
    keywords: [
      "internet", "network", "jaringan", "wifi", "wi-fi", "koneksi", "connection", "connect", "konek",
      "vpn", "bandwidth", "server", "dns", "ip", "lan", "wan", "router", "modem",
      "lemot", "slow", "lambat", "lag",
      "komputer", "computer", "laptop", "pc", "desktop", "hardware", "mouse", "keyboard",
      "monitor", "layar", "display", "screen", "cpu", "ram", "hardisk", "ssd", "printer", "scanner",
      "rusak", "broken", "error", "tidak berfungsi", "mati", "tidak nyala",
      "software", "aplikasi", "application", "app", "program", "sistem", "system",
      "windows", "linux", "mac", "install", "instalasi", "update", "upgrade", "patch",
      "bug", "crash", "hang", "freeze", "restart", "blue screen", "bsod", "not responding", "tidak merespon",
      "email", "outlook", "gmail", "mail", "password", "kata sandi", "login", "akses", "access",
      "account", "akun", "username", "terkunci", "locked", "lupa password", "forgot password", "reset password",
      "database", "db", "sql", "data", "backup", "restore", "permission", "denied", "ditolak", "folder", "file",
    ],
    weight: 1.0,
  },
  "ACC/FINANCE": {
    keywords: [
      "pembayaran", "bayar", "dibayar", "membayar", "payment", "pay", "paid",
      "tagihan", "bill", "invoice", "faktur",
      "reimbursement", "reimburse", "reimburs", "klaim", "claim",
      "transfer", "dana", "uang", "money", "cash", "tunai",
      "keuangan", "finance", "financial", "budget", "anggaran", "biaya", "cost", "expense", "pengeluaran",
      "hutang", "debt", "piutang", "receivable", "accounting", "akuntansi", "akunting",
      "transaksi", "transaction", "refund", "pengembalian",
      "bonus", "insentif", "incentive", "komisi", "commission",
      "bank", "rekening", "rekonsiliasi", "reconciliation",
      "laporan keuangan", "financial report", "cash flow",
    ],
    weight: 1.0,
  },
  OPERASIONAL: {
    keywords: [
      "pengiriman", "delivery", "kirim", "ship", "shipping",
      "barang", "goods", "cargo", "paket", "package",
      "terlambat", "delay", "late", "telat",
      "stok", "stock", "inventory", "persediaan", "gudang", "warehouse", "storage",
      "habis", "out of stock", "kosong", "empty",
      "supply chain", "logistik", "logistics", "vendor", "supplier", "pemasok",
      "procurement", "pengadaan", "produksi", "production", "manufacture",
      "mesin", "machine", "equipment", "peralatan", "maintenance", "pemeliharaan", "perbaikan",
      "quality", "kualitas", "quality control", "qc", "defect", "cacat", "reject", "retur",
      "operasional", "operational", "operation", "proses", "process", "workflow",
      "ruangan", "room", "parkir", "parking", "ac", "air conditioner", "lift", "elevator",
    ],
    weight: 1.0,
  },
  SALES: {
    keywords: [
      "penjualan", "sales", "sell", "jual", "target", "quota", "kuota",
      "deal", "closing", "close",
      "marketing", "promosi", "promotion", "promo", "campaign", "kampanye", "iklan", "advertising",
      "branding", "brand", "lead", "prospek", "prospect",
      "customer", "pelanggan", "klien", "client", "order", "pesanan", "purchase",
      "harga", "price", "pricing", "diskon", "discount", "potongan",
      "quotation", "penawaran", "quote",
      "produk", "product", "katalog", "catalog",
      "sales report", "laporan penjualan", "revenue", "pendapatan", "omzet",
      "distributor", "reseller", "retailer",
    ],
    weight: 1.0,
  },
  "CUSTOMER SERVICE": {
    keywords: [
      "komplain", "complaint", "keluhan", "complain", "tidak puas", "dissatisfied", "kecewa",
      "customer service", "layanan pelanggan", "cs", "pelayanan", "service", "dukungan", "support",
      "return", "retur", "pengembalian", "refund", "uang kembali", "tukar", "exchange", "ganti",
      "respon", "response", "tidak ada jawaban", "no response",
      "pelanggan marah", "angry customer", "customer feedback", "feedback pelanggan",
      "testimoni", "testimonial", "review",
      "after sales", "purna jual", "garansi", "warranty", "claim garansi",
      "handle", "menangani", "penanganan",
    ],
    weight: 1.0,
  },
  HR: {
    keywords: [
      "cuti", "leave", "izin", "sakit", "sick",
      "absen", "absensi", "attendance", "hadir", "kehadiran",
      "alpha", "mangkir", "terlambat", "lembur", "overtime", "ot", "shift",
      "kontrak", "contract", "perjanjian kerja",
      "resign", "pengunduran diri", "berhenti", "keluar",
      "recruitment", "rekrutmen", "hiring", "perekrutan",
      "karyawan", "employee", "staff", "pegawai", "pekerja",
      "training", "pelatihan", "workshop", "seminar", "onboarding", "orientasi",
      "promosi", "kenaikan jabatan", "mutasi", "rotasi", "rotation",
      "penilaian", "evaluation", "performance", "kinerja", "appraisal", "performance review",
      "tunjangan", "allowance", "benefit", "asuransi", "insurance", "bpjs", "jaminan",
      "kesehatan", "health", "medical",
      "gaji", "salary", "slip gaji", "payslip", "pay slip", "upah", "wage",
      "pembayaran gaji", "salary payment", "payroll", "take home pay", "thp",
      "gaji bersih", "net salary", "potongan gaji", "salary deduction", "penggajian",
      "hr", "human resources", "sdm", "sumber daya manusia",
      "konflik", "conflict", "masalah karyawan",
    ],
    weight: 1.0,
  },
  "DIREKSI/DIREKTUR": {
    keywords: [
      "strategi", "strategic", "strategy", "planning", "perencanaan", "rencana",
      "bisnis", "business", "development",
      "direksi", "direktur", "director", "executive", "board", "dewan", "komisaris",
      "ceo", "cfo", "coo", "cto",
      "rapat direksi", "board meeting", "rapat pimpinan", "management meeting",
      "keputusan", "decision", "approval", "persetujuan", "otorisasi", "authorization",
      "korporat", "corporate", "perusahaan", "company",
      "merger", "akuisisi", "acquisition", "ekspansi", "expansion",
      "kebijakan", "policy", "peraturan", "regulasi", "regulation",
      "laporan ke direksi", "executive report", "presentasi direksi", "board presentation",
      "investasi", "investment", "modal", "capital",
    ],
    weight: 1.0,
  },
  General: {
    keywords: [
      "lainnya", "other", "umum", "general",
      "pertanyaan", "question", "tanya",
      "informasi", "information", "info",
      "bantuan", "help", "support",
    ],
    weight: 0.3,
  },
}

function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function calculateScore(text: string, keywords: string[], weight: number): [number, string[]] {
  const processed = preprocessText(text)
  const words = new Set(processed.split(" "))
  let score = 0
  const matched: string[] = []

  for (const keyword of keywords) {
    const kw = preprocessText(keyword)
    const kwWords = kw.split(" ")

    if (kwWords.length > 1) {
      if (processed.includes(kw)) {
        score += 3.0 * weight
        matched.push(keyword)
      }
    } else {
      if (words.has(kw)) {
        score += 2.0 * weight
        matched.push(keyword)
      } else if ([...words].some((w) => w.includes(kw))) {
        score += 1.0 * weight
        matched.push(`~${keyword}`)
      }
    }
  }

  return [score, [...new Set(matched)]]
}

export function classify(text: string): ClassifyResult {
  if (!text?.trim()) {
    return {
      category: "General",
      confidence: 0,
      matched_keywords: [],
      all_scores: {},
      method: "empty_input",
    }
  }

  const results: Record<string, { score: number; matched: string[] }> = {}

  for (const [category, config] of Object.entries(CATEGORIES)) {
    const [score, matched] = calculateScore(text, config.keywords, config.weight)
    results[category] = { score, matched }
  }

  const [bestCategory, bestData] = Object.entries(results).reduce((a, b) =>
    b[1].score > a[1].score ? b : a
  )

  const allScores = Object.fromEntries(
    Object.entries(results).map(([k, v]) => [k, Math.round(v.score * 100) / 100])
  )

  if (bestData.score === 0) {
    return {
      category: "General",
      confidence: 0,
      matched_keywords: [],
      all_scores: allScores,
      method: "no_match_found",
    }
  }

  return {
    category: bestCategory,
    confidence: Math.round(Math.min(bestData.score / 10, 1) * 100) / 100,
    matched_keywords: bestData.matched.slice(0, 10),
    all_scores: allScores,
    method: "keyword_matching",
  }
}

export function getSuggestions(text: string, limit = 3) {
  const result = classify(text)
  return Object.entries(result.all_scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category, score]) => ({
      category,
      score,
      confidence: Math.round(Math.min(score / 10, 1) * 100) / 100,
    }))
}
