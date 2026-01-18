// app/api/tickets/export/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import ExcelJS from "exceljs"
import PDFDocument from "pdfkit"

// Helper function to generate ticket code
const generateTicketCode = (category: string, ticketId: number): string => {
  const divisionPrefixes: { [key: string]: string } = {
    "IT": "IT",
    "Akuntansi": "ACC",
    "Finance": "ACC",
    "Keuangan": "ACC",
    "Operasional": "OPR",
    "Sales": "SLS",
    "Penjualan": "SLS",
    "Customer Service": "CS",
    "HR": "HR",
    "HRD": "HR",
    "Direksi": "DKT",
    "Direktur": "DKT",
  }

  let prefix = "TKT"
  const categoryLower = category?.toLowerCase() || ""

  for (const [key, value] of Object.entries(divisionPrefixes)) {
    if (categoryLower === key.toLowerCase() ||
        categoryLower.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(categoryLower)) {
      prefix = value
      break
    }
  }

  return `${prefix}-${String(ticketId).padStart(3, '0')}`
}

// Helper function to format status
const formatStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
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

  // Only super_admin can export reports
  if (decoded.role !== "super_admin") {
    return NextResponse.json(
      { error: "Hanya Super Admin yang dapat mengekspor laporan" },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "excel" // excel or pdf
    const category = searchParams.get("category") || ""
    const division = searchParams.get("division") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const status = searchParams.get("status") || ""

    // Build query with filters
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
        u.division as user_division
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
      return generatePDF(tickets, { category, division, startDate, endDate, status })
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
  workbook.creator = "Sistem Helpdesk SJPL"
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet("Laporan Tiket")

  // Title
  worksheet.mergeCells("A1:H1")
  const titleCell = worksheet.getCell("A1")
  titleCell.value = "LAPORAN TIKET HELPDESK"
  titleCell.font = { bold: true, size: 16 }
  titleCell.alignment = { horizontal: "center" }

  // Filter info
  let filterText = "Filter: "
  const filterParts = []
  if (filters.category) filterParts.push(`Kategori: ${filters.category}`)
  if (filters.division) filterParts.push(`Divisi: ${filters.division}`)
  if (filters.status) filterParts.push(`Status: ${formatStatus(filters.status)}`)
  if (filters.startDate) filterParts.push(`Dari: ${filters.startDate}`)
  if (filters.endDate) filterParts.push(`Sampai: ${filters.endDate}`)

  if (filterParts.length > 0) {
    filterText += filterParts.join(" | ")
  } else {
    filterText += "Semua Data"
  }

  worksheet.mergeCells("A2:H2")
  const filterCell = worksheet.getCell("A2")
  filterCell.value = filterText
  filterCell.font = { italic: true, size: 10 }
  filterCell.alignment = { horizontal: "center" }

  // Generated date
  worksheet.mergeCells("A3:H3")
  const dateCell = worksheet.getCell("A3")
  dateCell.value = `Dibuat pada: ${new Date().toLocaleString("id-ID")}`
  dateCell.font = { size: 10 }
  dateCell.alignment = { horizontal: "center" }

  // Empty row
  worksheet.addRow([])

  // Headers
  const headerRow = worksheet.addRow([
    "No",
    "ID Tiket",
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

  // Data rows
  tickets.forEach((ticket, index) => {
    let targetDivs = ""
    try {
      targetDivs = JSON.parse(ticket.target_divisions || "[]").join(", ")
    } catch (e) {
      targetDivs = ticket.target_divisions || ""
    }

    const row = worksheet.addRow([
      index + 1,
      generateTicketCode(ticket.nlp_category, ticket.id),
      ticket.title,
      ticket.description?.substring(0, 100) + (ticket.description?.length > 100 ? "..." : ""),
      formatStatus(ticket.status),
      ticket.nlp_category || "-",
      ticket.user_division || "-",
      ticket.user_name,
      targetDivs || "-",
      new Date(ticket.created_at).toLocaleString("id-ID")
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

    // Status color
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

  // Summary row
  worksheet.addRow([])
  const summaryRow = worksheet.addRow([`Total Tiket: ${tickets.length}`])
  summaryRow.getCell(1).font = { bold: true }

  // Column widths
  worksheet.columns = [
    { width: 5 },   // No
    { width: 12 },  // ID Tiket
    { width: 30 },  // Judul
    { width: 40 },  // Deskripsi
    { width: 15 },  // Status
    { width: 15 },  // Kategori
    { width: 15 },  // Divisi Pembuat
    { width: 20 },  // Pembuat
    { width: 20 },  // Target Divisi
    { width: 20 }   // Tanggal
  ]

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()

  const filename = `laporan-tiket-${new Date().toISOString().split("T")[0]}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  })
}

async function generatePDF(
  tickets: any[],
  filters: { category: string; division: string; startDate: string; endDate: string; status: string }
) {
  return new Promise<NextResponse>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        layout: "landscape"
      })

      const chunks: Buffer[] = []
      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks)
        const filename = `laporan-tiket-${new Date().toISOString().split("T")[0]}.pdf`

        resolve(new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`
          }
        }))
      })

      // Title
      doc.fontSize(18).font("Helvetica-Bold").text("LAPORAN TIKET HELPDESK", { align: "center" })
      doc.moveDown(0.5)

      // Filter info
      let filterText = "Filter: "
      const filterParts = []
      if (filters.category) filterParts.push(`Kategori: ${filters.category}`)
      if (filters.division) filterParts.push(`Divisi: ${filters.division}`)
      if (filters.status) filterParts.push(`Status: ${formatStatus(filters.status)}`)
      if (filters.startDate) filterParts.push(`Dari: ${filters.startDate}`)
      if (filters.endDate) filterParts.push(`Sampai: ${filters.endDate}`)

      if (filterParts.length > 0) {
        filterText += filterParts.join(" | ")
      } else {
        filterText += "Semua Data"
      }

      doc.fontSize(10).font("Helvetica").text(filterText, { align: "center" })
      doc.fontSize(9).text(`Dibuat pada: ${new Date().toLocaleString("id-ID")}`, { align: "center" })
      doc.moveDown()

      // Table headers
      const tableTop = doc.y
      const colWidths = [30, 60, 150, 80, 80, 100, 80, 100]
      const headers = ["No", "ID Tiket", "Judul", "Status", "Kategori", "Pembuat", "Divisi", "Tanggal"]

      let xPos = 40
      doc.fontSize(9).font("Helvetica-Bold")

      // Header background
      doc.rect(40, tableTop - 5, 760, 20).fill("#2563EB")
      doc.fillColor("white")

      headers.forEach((header, i) => {
        doc.text(header, xPos + 2, tableTop, { width: colWidths[i] - 4, align: "left" })
        xPos += colWidths[i]
      })

      doc.fillColor("black")
      let yPos = tableTop + 20

      // Table rows
      doc.font("Helvetica").fontSize(8)

      tickets.forEach((ticket, index) => {
        // Check if we need a new page
        if (yPos > 520) {
          doc.addPage()
          yPos = 40

          // Re-draw headers on new page
          xPos = 40
          doc.fontSize(9).font("Helvetica-Bold")
          doc.rect(40, yPos - 5, 760, 20).fill("#2563EB")
          doc.fillColor("white")
          headers.forEach((header, i) => {
            doc.text(header, xPos + 2, yPos, { width: colWidths[i] - 4, align: "left" })
            xPos += colWidths[i]
          })
          doc.fillColor("black")
          doc.font("Helvetica").fontSize(8)
          yPos += 20
        }

        // Alternate row color
        if (index % 2 === 0) {
          doc.rect(40, yPos - 3, 760, 18).fill("#F3F4F6")
          doc.fillColor("black")
        }

        xPos = 40
        const rowData = [
          String(index + 1),
          generateTicketCode(ticket.nlp_category, ticket.id),
          ticket.title?.substring(0, 35) + (ticket.title?.length > 35 ? "..." : ""),
          formatStatus(ticket.status),
          ticket.nlp_category || "-",
          ticket.user_name?.substring(0, 20) || "-",
          ticket.user_division || "-",
          new Date(ticket.created_at).toLocaleDateString("id-ID")
        ]

        rowData.forEach((data, i) => {
          doc.text(data, xPos + 2, yPos, { width: colWidths[i] - 4, align: "left" })
          xPos += colWidths[i]
        })

        yPos += 18
      })

      // Summary
      doc.moveDown(2)
      doc.fontSize(10).font("Helvetica-Bold")
      doc.text(`Total Tiket: ${tickets.length}`, 40)

      // Footer
      const pageCount = doc.bufferedPageRange().count
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i)
        doc.fontSize(8).font("Helvetica")
        doc.text(
          `Halaman ${i + 1} dari ${pageCount}`,
          40,
          doc.page.height - 30,
          { align: "center", width: doc.page.width - 80 }
        )
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
