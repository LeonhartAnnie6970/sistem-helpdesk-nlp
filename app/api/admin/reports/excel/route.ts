import { type NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token is admin
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get admin's division
    const adminInfo: any = await query(
      "SELECT division FROM users WHERE id = ?",
      [decoded.userId]
    )
    const adminDivision = adminInfo[0]?.division

    if (!adminDivision) {
      return NextResponse.json({ error: "Admin division not found" }, { status: 400 })
    }

    const { status: filterStatus } = await request.json()

    // Fetch tickets filtered by admin's division
    // Tickets from users in admin's division OR targeted to admin's division
    let sqlQuery = `
      SELECT DISTINCT t.id, t.title, t.description, t.nlp_category as category, t.status, t.created_at, u.name, u.division as divisi, u.email,
        (SELECT COUNT(*) FROM tickets t2 WHERE t2.id <= t.id) AS ticket_sequence
      FROM tickets t
      JOIN users u ON t.id_user = u.id
      WHERE (u.division = ? OR JSON_CONTAINS(t.target_divisions, JSON_QUOTE(?)))
    `
    const params: any[] = [adminDivision, adminDivision]

    if (filterStatus && filterStatus !== "all") {
      sqlQuery += ` AND t.status = ?`
      params.push(filterStatus)
    }

    sqlQuery += ` ORDER BY t.created_at DESC`

    const ticketsData: any = await query(sqlQuery, params)

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Laporan Tiket")

    // Add title row
    worksheet.mergeCells('A1:I1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = 'Laporan Tiket Helpdesk'
    titleCell.font = { bold: true, size: 16 }
    titleCell.alignment = { horizontal: 'center' }

    // Add division info
    worksheet.mergeCells('A2:I2')
    const divisionCell = worksheet.getCell('A2')
    divisionCell.value = `Divisi: ${adminDivision}`
    divisionCell.alignment = { horizontal: 'center' }

    // Add date info
    worksheet.mergeCells('A3:I3')
    const dateCell = worksheet.getCell('A3')
    dateCell.value = `Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`
    dateCell.alignment = { horizontal: 'center' }

    // Add filter info if applicable
    if (filterStatus && filterStatus !== "all") {
      worksheet.mergeCells('A4:I4')
      const filterCell = worksheet.getCell('A4')
      filterCell.value = `Filter Status: ${filterStatus.toUpperCase()}`
      filterCell.alignment = { horizontal: 'center' }
    }

    // Add empty row
    worksheet.addRow([])

    // Add header row
    const headerRow = worksheet.addRow([
      "ID", "Judul", "Deskripsi", "Kategori", "Status", "User", "Divisi", "Email", "Tanggal"
    ])

    // Style header
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3b82f6" } }

    // Set column widths
    worksheet.columns = [
      { width: 10 },
      { width: 25 },
      { width: 35 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 18 },
    ]

    // Format ticket ID as sequential number with division prefix
    const divisionPrefixMap: Record<string, string> = {
      'IT': 'IT', 'INFORMATION TECHNOLOGY': 'IT',
      'ACC/FINANCE': 'ACC', 'ACCOUNTING': 'ACC', 'FINANCE': 'ACC', 'KEUANGAN': 'ACC',
      'OPERASIONAL': 'OPR', 'OPERATIONAL': 'OPR',
      'SALES': 'SLS', 'PENJUALAN': 'SLS',
      'CUSTOMER SERVICE': 'CS',
      'HR': 'HR', 'HRD': 'HR', 'HUMAN RESOURCE': 'HR',
      'DIREKSI/DIREKTUR': 'DIR', 'DIREKSI': 'DIR', 'DIREKTUR': 'DIR',
    }
    const getPrefix = (div: string) => divisionPrefixMap[div?.toUpperCase()?.trim()] || div?.substring(0, 3).toUpperCase() || 'TKT'
    const formatId = (ticket: any) => {
      const prefix = getPrefix(ticket.divisi)
      const seq = ticket.ticket_sequence ?? ticket.id
      return `${prefix}-${String(seq).padStart(3, '0')}`
    }

    // Add data rows
    ticketsData.forEach((ticket: any) => {
      worksheet.addRow([
        formatId(ticket),
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.status,
        ticket.name,
        ticket.divisi,
        ticket.email,
        new Date(ticket.created_at).toLocaleDateString("id-ID"),
      ])
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan-tiket-${adminDivision}-${new Date().getTime()}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Excel generation error:", error)
    return NextResponse.json({ error: "Failed to generate Excel" }, { status: 500 })
  }
}
