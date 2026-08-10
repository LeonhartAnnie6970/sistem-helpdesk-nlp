// Konfigurasi tingkat urgensi tiket dan SLA (batas waktu proses) per level.
// Sengaja konstanta di kode (bukan tabel DB) - belum ada kebutuhan UI admin
// untuk mengedit ini secara dinamis. Gampang dipindah ke DB nanti kalau perlu.

export const URGENCY_LEVELS = ["low", "medium", "high", "critical"] as const
export type Urgency = (typeof URGENCY_LEVELS)[number]

export function isValidUrgency(value: string): value is Urgency {
  return (URGENCY_LEVELS as readonly string[]).includes(value)
}

export const URGENCY_SLA_HOURS: Record<Urgency, number> = {
  critical: 4,
  high: 24,
  medium: 24 * 3,
  low: 24 * 7,
}

export const URGENCY_META: Record<Urgency, { label: string; color: string; order: number }> = {
  critical: { label: "Kritis", color: "bg-red-600 text-white", order: 3 },
  high: { label: "Tinggi", color: "bg-orange-500 text-white", order: 2 },
  medium: { label: "Sedang", color: "bg-yellow-500 text-white", order: 1 },
  low: { label: "Rendah", color: "bg-green-600 text-white", order: 0 },
}

export function getSlaHours(urgency: string): number {
  return isValidUrgency(urgency) ? URGENCY_SLA_HOURS[urgency] : URGENCY_SLA_HOURS.medium
}

// PENTING: deadline_at SELALU dihitung di SQL - `DATE_ADD(NOW(), INTERVAL ? HOUR)`
// atau `DATE_ADD(COALESCE(approved_at, created_at), INTERVAL ? HOUR)` - bukan di
// JS lalu di-insert sebagai string. Kalau dihitung di JS (new Date() + toISOString)
// lalu ditulis sebagai literal string, MySQL/TiDB akan menafsirkannya sesuai
// timezone SESSION, sedangkan approved_at/created_at pakai NOW() (timezone server
// DB) - selisihnya jadi sama dengan offset timezone server, salah tapi diam-diam
// (silent bug). Hitung sepenuhnya di SQL supaya satu sumber waktu yang sama.

/**
 * Info sisa waktu / keterlambatan tiket relatif terhadap deadline-nya,
 * dihitung on-the-fly (client-side) - tidak butuh cron/scheduled job.
 * Return null kalau tidak relevan (belum ada deadline, atau tiket sudah selesai).
 */
export function getDeadlineInfo(
  deadlineAt: string | Date | null | undefined,
  status: string
): { label: string; overdue: boolean } | null {
  if (!deadlineAt) return null
  if (status === "resolved" || status === "closed") return null

  const deadline = typeof deadlineAt === "string" ? new Date(deadlineAt) : deadlineAt
  const diffMs = deadline.getTime() - Date.now()
  const overdue = diffMs < 0
  const absMs = Math.abs(diffMs)

  const hours = Math.floor(absMs / (60 * 60 * 1000))
  const days = Math.floor(hours / 24)

  let timeLabel: string
  if (days >= 1) {
    timeLabel = `${days} hari`
  } else if (hours >= 1) {
    timeLabel = `${hours} jam`
  } else {
    const minutes = Math.max(1, Math.floor(absMs / (60 * 1000)))
    timeLabel = `${minutes} menit`
  }

  return {
    label: overdue ? `Terlambat ${timeLabel}` : `${timeLabel} lagi`,
    overdue,
  }
}
