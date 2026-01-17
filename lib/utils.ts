import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ticket ID dengan prefix divisi
 * @param ticketId - ID ticket numeric dari database
 * @param division - Nama divisi (contoh: "ACC/FINANCE", "Operasional", "HR")
 * @returns Formatted ticket ID (contoh: "ACC-001", "OPR-003", "HR-012")
 */
export function formatTicketId(ticketId: number, division?: string | null): string {
  // Mapping divisi ke prefix
  const divisionPrefixMap: Record<string, string> = {
    'ACC/FINANCE': 'ACC',
    'ACCOUNTING/FINANCE': 'ACC',
    'ACCOUNTING': 'ACC',
    'FINANCE': 'FIN',
    'OPERASIONAL': 'OPR',
    'OPERATIONAL': 'OPR',
    'HR': 'HR',
    'HUMAN RESOURCE': 'HR',
    'HUMAN RESOURCES': 'HR',
    'IT': 'IT',
    'INFORMATION TECHNOLOGY': 'IT',
    'TEKNOLOGI INFORMASI': 'IT',
    'MARKETING': 'MKT',
    'SALES': 'SLS',
    'CUSTOMER SERVICE': 'CS',
    'DIREKSI/DIREKTUR': 'DIR',
    'GENERAL': 'GEN',
    'UMUM': 'GEN',
  }

  // Handle null/undefined division
  if (!division) {
    const paddedId = ticketId.toString().padStart(3, '0')
    return `TKT-${paddedId}`
  }

  // Normalisasi division name (uppercase dan trim)
  const normalizedDivision = division.toUpperCase().trim()

  // Cari prefix yang cocok
  let prefix = divisionPrefixMap[normalizedDivision]

  // Jika tidak ditemukan di mapping, gunakan 3 huruf pertama dari divisi
  if (!prefix) {
    prefix = normalizedDivision.substring(0, 3).replace(/[^A-Z]/g, '')
    if (prefix.length === 0) prefix = 'GEN'
  }

  // Format ID dengan padding 3 digit
  const paddedId = ticketId.toString().padStart(3, '0')

  return `${prefix}-${paddedId}`
}