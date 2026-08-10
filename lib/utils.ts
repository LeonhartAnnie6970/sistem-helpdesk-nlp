import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toast notification utilities
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description })
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description })
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description })
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description })
  },
  loading: (message: string) => {
    return toast.loading(message)
  },
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  }
}

/**
 * Safely parse target_divisions — handles both JSON array and legacy comma-separated strings.
 * e.g. '["IT","HR"]' → ["IT","HR"]
 *      "IT,HR"        → ["IT","HR"]
 *      null/""        → []
 */
export function parseTargetDivisions(value: string | string[] | null | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []
  const trimmed = value.trim()
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      // fall through
    }
  }
  return trimmed.split(',').map((d) => d.trim()).filter(Boolean)
}

/**
 * Meta (label + warna badge) untuk approval_status tiket lintas divisi.
 * Return null untuk 'not_required' / kosong agar tidak menambah noise di UI.
 */
export function getApprovalStatusMeta(approvalStatus?: string | null): { label: string; className: string } | null {
  switch (approvalStatus) {
    case 'pending':
      return { label: 'Menunggu Persetujuan', className: 'bg-amber-500 text-white' }
    case 'approved':
      return { label: 'Disetujui', className: 'bg-emerald-600 text-white' }
    case 'rejected':
      return { label: 'Ditolak', className: 'bg-red-600 text-white' }
    default:
      return null
  }
}

/**
 * Format ticket ID dengan prefix divisi
 * @param ticketId - ID ticket numeric dari database
 * @param division - Nama divisi (contoh: "ACC/FINANCE", "Operasional", "HR")
 * @returns Formatted ticket ID (contoh: "ACC-001", "OPR-003", "HR-012")
 */
export function formatTicketId(ticketId: number, division?: string | null, sequence?: number | null): string {
  // Mapping divisi ke prefix — single source of truth untuk seluruh aplikasi
  const divisionPrefixMap: Record<string, string> = {
    // IT
    'IT': 'IT',
    'INFORMATION TECHNOLOGY': 'IT',
    'TEKNOLOGI INFORMASI': 'IT',
    // Akuntansi / Finance
    'ACC/FINANCE': 'ACC',
    'ACCOUNTING/FINANCE': 'ACC',
    'ACCOUNTING': 'ACC',
    'FINANCE': 'ACC',
    'KEUANGAN': 'ACC',
    'AKUNTANSI': 'ACC',
    // Operasional
    'OPERASIONAL': 'OPR',
    'OPERATIONAL': 'OPR',
    'OPERATIONS': 'OPR',
    // Sales
    'SALES': 'SLS',
    'PENJUALAN': 'SLS',
    // Customer Service
    'CUSTOMER SERVICE': 'CS',
    'PELAYANAN': 'CS',
    // HR
    'HR': 'HR',
    'HRD': 'HR',
    'HUMAN RESOURCE': 'HR',
    'HUMAN RESOURCES': 'HR',
    'SDM': 'HR',
    // Direksi / Direktur
    'DIREKSI/DIREKTUR': 'DIR',
    'DIREKSI': 'DIR',
    'DIREKTUR': 'DIR',
    'MANAGEMENT': 'DIR',
    // General
    'GENERAL': 'GEN',
    'UMUM': 'GEN',
    'MARKETING': 'MKT',
  }

  // Handle null/undefined division
  if (!division) {
    const paddedId = ticketId.toString().padStart(3, '0')
    return `TKT-${paddedId}`
  }

  // Normalisasi division name (uppercase dan trim)
  const normalizedDivision = division.toUpperCase().trim()

  // Cari prefix yang cocok (exact match dulu, lalu partial match)
  let prefix = divisionPrefixMap[normalizedDivision]

  if (!prefix) {
    // Coba partial match
    for (const [key, value] of Object.entries(divisionPrefixMap)) {
      if (normalizedDivision.includes(key) || key.includes(normalizedDivision)) {
        prefix = value
        break
      }
    }
  }

  // Fallback: 3 huruf pertama
  if (!prefix) {
    prefix = normalizedDivision.substring(0, 3).replace(/[^A-Z]/g, '')
    if (prefix.length === 0) prefix = 'GEN'
  }

  // Gunakan sequence number jika tersedia, fallback ke ticketId
  const displayNumber = sequence ?? ticketId
  const paddedId = displayNumber.toString().padStart(3, '0')

  return `${prefix}-${paddedId}`
}