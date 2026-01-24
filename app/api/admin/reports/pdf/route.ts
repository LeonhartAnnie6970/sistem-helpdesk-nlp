import { type NextRequest, NextResponse } from "next/server"
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
      SELECT DISTINCT t.id, t.title, t.description, t.nlp_category as category, t.status, t.created_at, u.name, u.division as divisi, u.email
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

    // Generate simple text-based PDF using HTML to PDF approach
    // Since PDFKit has font issues in Next.js, we'll generate a simple text report

    const statusLabels: Record<string, string> = {
      'new': 'Baru',
      'in_progress': 'Diproses',
      'resolved': 'Selesai',
      'closed': 'Ditutup'
    }

    // Build HTML content for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; color: #333; }
        .header-info { text-align: center; margin-bottom: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-new { color: #3b82f6; }
        .status-in_progress { color: #eab308; }
        .status-resolved { color: #22c55e; }
        .status-closed { color: #6b7280; }
      </style>
    </head>
    <body>
      <h1>Laporan Tiket Helpdesk</h1>
      <div class="header-info">
        <p>Divisi: ${adminDivision}</p>
        <p>Tanggal: ${new Date().toLocaleDateString("id-ID")}</p>
        ${filterStatus && filterStatus !== "all" ? `<p>Filter Status: ${statusLabels[filterStatus] || filterStatus.toUpperCase()}</p>` : ''}
        <p>Total Tiket: ${ticketsData.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul</th>
            <th>User</th>
            <th>Divisi</th>
            <th>Kategori</th>
            <th>Status</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          ${ticketsData.map((ticket: any) => `
            <tr>
              <td>${ticket.id}</td>
              <td>${ticket.title}</td>
              <td>${ticket.name}</td>
              <td>${ticket.divisi}</td>
              <td>${ticket.category || '-'}</td>
              <td class="status-${ticket.status}">${statusLabels[ticket.status] || ticket.status}</td>
              <td>${new Date(ticket.created_at).toLocaleDateString("id-ID")}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
    `

    // Return HTML as downloadable file (users can print to PDF from browser)
    // Or we can use a different approach - return as HTML that can be printed
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-tiket-${adminDivision}-${new Date().getTime()}.html"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
