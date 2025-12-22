import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token is admin
    const sql = neon(process.env.DATABASE_URL!)
    const authResult = await sql("SELECT role FROM users WHERE token = ?", [token])
    if (!authResult || authResult.length === 0 || authResult[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status } = await request.json()

    // Fetch tickets berdasarkan status
    let query = `
      SELECT t.id, t.title, t.description, t.category, t.status, t.created_at, u.name, u.divisi, u.email
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `

    let ticketsData
    if (status && status !== "all") {
      query = query.replace("ORDER BY", `WHERE t.status = ? ORDER BY`)
      ticketsData = await sql(query, [status])
    } else {
      ticketsData = await sql(query)
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Laporan Tiket")

    // Add header
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Judul", key: "title", width: 25 },
      { header: "Deskripsi", key: "description", width: 35 },
      { header: "Kategori", key: "category", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "User", key: "name", width: 15 },
      { header: "Divisi", key: "divisi", width: 15 },
      { header: "Email", key: "email", width: 20 },
      { header: "Tanggal", key: "created_at", width: 18 },
    ]

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3b82f6" } }

    // Add data rows
    ticketsData.forEach((ticket: any) => {
      worksheet.addRow({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        status: ticket.status,
        name: ticket.name,
        divisi: ticket.divisi,
        email: ticket.email,
        created_at: new Date(ticket.created_at).toLocaleDateString("id-ID"),
      })
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan-tiket-${new Date().getTime()}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Excel generation error:", error)
    return NextResponse.json({ error: "Failed to generate Excel" }, { status: 500 })
  }
}
