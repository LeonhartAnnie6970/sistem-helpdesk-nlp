// TAHAP 1: REFACTOR DIVISIONS
// File: lib/divisions-refactor.ts
// Deskripsi: Update daftar divisi sesuai requirement sistem monitoring

/**
 * Daftar divisi untuk sistem monitoring divisi
 * Sesuai dengan requirement: IT, ACC/FINANCE, OPERASIONAL, SALES, CUSTOMER SERVICE, HR, DIREKSI
 */
export const DIVISIONS_MONITORING = [
  "IT & Teknologi",
  "ACC / FINANCE",
  "OPERASIONAL",
  "SALES",
  "CUSTOMER SERVICE",
  "HR",
  "DIREKSI",
] as const

export type DivisionMonitoring = (typeof DIVISIONS_MONITORING)[number]

/**
 * Mapping divisi untuk klasifikasi NLP
 * Key: divisi, Value: keywords yang relevan
 */
export const DIVISION_KEYWORDS: Record<DivisionMonitoring, string[]> = {
  "IT & Teknologi": [
    "komputer",
    "laptop",
    "jaringan",
    "wifi",
    "internet",
    "server",
    "database",
    "sistem",
    "software",
    "hardware",
    "printer",
    "email",
    "website",
    "aplikasi",
    "error",
    "bug",
    "crash",
    "login",
    "password",
    "network",
    "vpn",
    "backup",
  ],
  "ACC / FINANCE": [
    "keuangan",
    "invoice",
    "pembayaran",
    "tagihan",
    "laporan keuangan",
    "budget",
    "akuntansi",
    "pajak",
    "transfer",
    "rekening",
    "bank",
    "gaji",
    "payroll",
    "pengeluaran",
    "pemasukan",
    "biaya",
    "accounting",
    "finance",
    "payment",
  ],
  OPERASIONAL: [
    "operasional",
    "produksi",
    "proses",
    "workflow",
    "prosedur",
    "sop",
    "maintenance",
    "perbaikan",
    "fasilitas",
    "gedung",
    "ruangan",
    "peralatan",
    "inventaris",
    "aset",
    "pengadaan",
    "procurement",
    "vendor",
    "supplier",
  ],
  SALES: [
    "penjualan",
    "sales",
    "customer",
    "klien",
    "pelanggan",
    "order",
    "pesanan",
    "quotation",
    "penawaran",
    "kontrak",
    "deal",
    "target",
    "marketing",
    "promosi",
    "diskon",
    "harga",
    "produk",
    "katalog",
    "client",
    "buyer",
  ],
  "CUSTOMER SERVICE": [
    "customer service",
    "cs",
    "keluhan",
    "komplain",
    "complain",
    "feedback",
    "layanan",
    "service",
    "bantuan",
    "help",
    "support",
    "pertanyaan",
    "question",
    "informasi",
    "inquiry",
    "pengaduan",
    "masalah pelanggan",
    "customer issue",
  ],
  HR: [
    "hr",
    "human resource",
    "karyawan",
    "staff",
    "pegawai",
    "recruitment",
    "rekrutmen",
    "training",
    "pelatihan",
    "cuti",
    "absensi",
    "attendance",
    "resign",
    "pengunduran diri",
    "kontrak kerja",
    "employee",
    "personnel",
    "benefit",
    "tunjangan",
    "kesehatan",
    "asuransi",
    "performance",
    "kinerja",
  ],
  DIREKSI: [
    "direksi",
    "direktur",
    "director",
    "manajemen",
    "management",
    "strategi",
    "kebijakan",
    "policy",
    "keputusan",
    "decision",
    "rapat",
    "meeting",
    "approval",
    "persetujuan",
    "urgent",
    "penting",
    "critical",
    "strategic",
  ],
}

export function isValidDivisionMonitoring(division: string): division is DivisionMonitoring {
  return DIVISIONS_MONITORING.includes(division as DivisionMonitoring)
}

/**
 * Get division color for badge/UI
 */
export function getDivisionColor(division: DivisionMonitoring): string {
  const colorMap: Record<DivisionMonitoring, string> = {
    "IT & Teknologi": "bg-blue-500",
    "ACC / FINANCE": "bg-green-500",
    OPERASIONAL: "bg-orange-500",
    SALES: "bg-purple-500",
    "CUSTOMER SERVICE": "bg-pink-500",
    HR: "bg-yellow-500",
    DIREKSI: "bg-red-500",
  }
  return colorMap[division] || "bg-gray-500"
}

export const DIVISIONS = DIVISIONS_MONITORING
