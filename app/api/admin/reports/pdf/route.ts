import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"
import PDFDocument from "pdfkit"

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

    // Generate PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    })

    let pdfBuffer = Buffer.alloc(0)

    doc.on("data", (chunk) => {
      pdfBuffer = Buffer.concat([pdfBuffer, chunk])
    })

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("Laporan Tiket Helpdesk", { align: "center" })
    doc.fontSize(12).font("Helvetica").text(new Date().toLocaleDateString("id-ID"), { align: "center" })

    if (status && status !== "all") {
      doc.text(`Filter Status: ${status.toUpperCase()}`)
    }

    doc.moveDown()

    // Table header
    const tableTop = doc.y
    const col1 = 50
    const col2 = 150
    const col3 = 250
    const col4 = 350
    const col5 = 450

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("ID", col1, tableTop)
      .text("Judul", col2, tableTop)
      .text("User/Divisi", col3, tableTop)
      .text("Kategori", col4, tableTop)
      .text("Status", col5, tableTop)

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke()

    // Table rows
    let y = tableTop + 25
    ticketsData.forEach((ticket: any) => {
      if (y > 750) {
        doc.addPage()
        y = 50
      }

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(ticket.id.toString(), col1, y)
        .text(ticket.title.substring(0, 20), col2, y)
        .text(`${ticket.name}/${ticket.divisi}`, col3, y)
        .text(ticket.category, col4, y)
        .text(ticket.status, col5, y)

      y += 20
    })

    doc.end()

    return new Promise((resolve) => {
      doc.on("finish", () => {
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="laporan-tiket-${new Date().getTime()}.pdf"`,
            },
          }),
        )
      })
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
