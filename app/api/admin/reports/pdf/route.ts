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

    // Return JSON data — PDF generated client-side using jsPDF
    return NextResponse.json({
      tickets: ticketsData,
      division: adminDivision,
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
