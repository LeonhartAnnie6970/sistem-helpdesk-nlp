import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Total tickets
    const totalTickets = await query("SELECT COUNT(*) as count FROM tickets")
    const totalCount = (totalTickets as any)[0]?.count || 0

    // Tickets by status
    const byStatus = await query(`SELECT status, COUNT(*) as count FROM tickets GROUP BY status`)

    // Tickets by category
    const byCategory = await query(
      `SELECT category, COUNT(*) as count FROM tickets WHERE category IS NOT NULL GROUP BY category`,
    )

    // Recent tickets
    const recentTickets = await query(
      `SELECT t.id, t.title, t.status, t.category, t.created_at, u.name 
       FROM tickets t 
       JOIN users u ON t.id_user = u.id 
       ORDER BY t.created_at DESC 
       LIMIT 10`,
    )

    // Total users
    const totalUsers = await query("SELECT COUNT(*) as count FROM users WHERE role = 'user'")
    const userCount = (totalUsers as any)[0]?.count || 0

    return NextResponse.json({
      totalTickets: totalCount,
      totalUsers: userCount,
      byStatus: Array.isArray(byStatus) ? byStatus : [],
      byCategory: Array.isArray(byCategory) ? byCategory : [],
      recentTickets: Array.isArray(recentTickets) ? recentTickets : [],
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
