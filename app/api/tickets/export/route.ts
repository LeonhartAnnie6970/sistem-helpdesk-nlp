// app/api/tickets/export/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import ExcelJS from "exceljs"

function parseTargetDivisions(value: string | string[] | null | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []
  const t = value.trim()
  if (t.startsWith('[')) { try { return JSON.parse(t) } catch {} }
  return t.split(',').map((d) => d.trim()).filter(Boolean)
}

const DIVISION_PREFIX_MAP: Record<string, string> = {
  'IT': 'IT',
  'INFORMATION TECHNOLOGY': 'IT',
  'ACC/FINANCE': 'ACC',
  'ACCOUNTING': 'ACC',
  'FINANCE': 'ACC',
  'KEUANGAN': 'ACC',
  'AKUNTANSI': 'ACC',
  'OPERASIONAL': 'OPR',
  'OPERATIONAL': 'OPR',
  'OPERATION': 'OPR',
  'SALES': 'SLS',
  'PENJUALAN': 'SLS',
  'CUSTOMER SERVICE': 'CS',
  'HR': 'HR',
  'HRD': 'HR',
  'HUMAN RESOURCE': 'HR',
  'HUMAN RESOURCES': 'HR',
  'DIREKSI/DIREKTUR': 'DIR',
  'DIREKSI': 'DIR',
  'DIREKTUR': 'DIR',
}

function getDivisionPrefix(division: string | null | undefined): string {
  if (!division) return 'TKT'
  const upper = division.toUpperCase().trim()
  if (DIVISION_PREFIX_MAP[upper]) return DIVISION_PREFIX_MAP[upper]
  // partial match
  for (const [key, prefix] of Object.entries(DIVISION_PREFIX_MAP)) {
    if (upper.includes(key) || key.includes(upper)) return prefix
  }
  return division.substring(0, 3).toUpperCase()
}

function formatTicketId(userDivision: string | null | undefined, sequence: number | null | undefined, fallbackId: number): string {
  const prefix = getDivisionPrefix(userDivision)
  const num = sequence ?? fallbackId
  return `${prefix}-${String(num).padStart(3, '0')}`
}

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    "new": "Baru",
    "in_progress": "Sedang Diproses",
    "resolved": "Selesai",
    "closed": "Ditutup"
  }
  return statusMap[status] || status
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  if (decoded.role !== "super_admin") {
    return NextResponse.json(
      { error: "Hanya Super Admin yang dapat mengekspor laporan" },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "excel"
    const category = searchParams.get("category") || ""
    const division = searchParams.get("division") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const status = searchParams.get("status") || ""

    let sql = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.nlp_category,
        t.target_divisions,
        t.created_at,
        t.updated_at,
        u.name as user_name,
        u.email as user_email,
        u.division as user_division,
        (SELECT COUNT(*) FROM tickets t2 WHERE t2.id <= t.id) AS ticket_sequence
      FROM tickets t
      JOIN users u ON t.id_user = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (category) {
      sql += ` AND t.nlp_category = ?`
      params.push(category)
    }

    if (division) {
      sql += ` AND u.division = ?`
      params.push(division)
    }

    if (status) {
      sql += ` AND t.status = ?`
      params.push(status)
    }

    if (startDate) {
      sql += ` AND DATE(t.created_at) >= ?`
      params.push(startDate)
    }

    if (endDate) {
      sql += ` AND DATE(t.created_at) <= ?`
      params.push(endDate)
    }

    sql += ` ORDER BY t.created_at DESC`

    const tickets: any[] = await query(sql, params) as any[]

    if (format === "pdf") {
      // Return JSON — PDF is generated client-side using jsPDF
      const filters = { category, division, startDate, endDate, status }
      return NextResponse.json({ tickets, filters })
    } else {
      return generateExcel(tickets, { category, division, startDate, endDate, status })
    }

  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateExcel(
  tickets: any[],
  filters: { category: string; division: string; startDate: string; endDate: string; status: string }
) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Sistem Helpdesk"
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet("Laporan Tiket")

  // Title
  worksheet.mergeCells("A1:J1")
  const titleCell = worksheet.getCell("A1")
  titleCell.value = "LAPORAN TIKET HELPDESK"
  titleCell.font = { bold: true, size: 16 }
  titleCell.alignment = { horizontal: "center" }

  // Filter info
  const filterParts: string[] = []
  if (filters.category) filterParts.push(`Kategori: ${filters.category}`)
  if (filters.division) filterParts.push(`Divisi: ${filters.division}`)
  if (filters.status) filterParts.push(`Status: ${formatStatus(filters.status)}`)
  if (filters.startDate) filterParts.push(`Dari: ${filters.startDate}`)
  if (filters.endDate) filterParts.push(`Sampai: ${filters.endDate}`)

  worksheet.mergeCells("A2:J2")
  const filterCell = worksheet.getCell("A2")
  filterCell.value = "Filter: " + (filterParts.length > 0 ? filterParts.join(" | ") : "Semua Data")
  filterCell.font = { italic: true, size: 10 }
  filterCell.alignment = { horizontal: "center" }

  worksheet.mergeCells("A3:J3")
  const dateCell = worksheet.getCell("A3")
  dateCell.value = `Dibuat pada: ${new Date().toLocaleDateString("id-ID")}`
  dateCell.font = { size: 10 }
  dateCell.alignment = { horizontal: "center" }

  worksheet.addRow([])

  const headerRow = worksheet.addRow([
    "No",
    "No. Tiket",
    "Judul",
    "Deskripsi",
    "Status",
    "Kategori",
    "Divisi Pembuat",
    "Pembuat",
    "Target Divisi",
    "Tanggal Dibuat"
  ])

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" }
    }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    }
  })

  tickets.forEach((ticket, index) => {
    let targetDivs = ""
    try {
      targetDivs = parseTargetDivisions(ticket.target_divisions).join(", ")
    } catch {
      targetDivs = ticket.target_divisions || ""
    }

    const ticketId = formatTicketId(ticket.user_division, ticket.ticket_sequence, ticket.id)

    const row = worksheet.addRow([
      index + 1,
      ticketId,
      ticket.title,
      ticket.description?.substring(0, 100) + (ticket.description?.length > 100 ? "..." : ""),
      formatStatus(ticket.status),
      ticket.nlp_category || "-",
      ticket.user_division || "-",
      ticket.user_name,
      targetDivs || "-",
      new Date(ticket.created_at).toLocaleDateString("id-ID")
    ])

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      }
      cell.alignment = { vertical: "middle", wrapText: true }
    })

    const statusCell = row.getCell(5)
    switch (ticket.status) {
      case "new":
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } }
        break
      case "in_progress":
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } }
        break
      case "resolved":
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } }
        break
      case "closed":
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } }
        break
    }
  })

  worksheet.addRow([])
  const summaryRow = worksheet.addRow([`Total Tiket: ${tickets.length}`])
  summaryRow.getCell(1).font = { bold: true }

  worksheet.columns = [
    { width: 5 },
    { width: 12 },
    { width: 30 },
    { width: 40 },
    { width: 15 },
    { width: 15 },
    { width: 18 },
    { width: 20 },
    { width: 22 },
    { width: 20 }
  ]

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `laporan-tiket-${new Date().toISOString().split("T")[0]}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  })
}
