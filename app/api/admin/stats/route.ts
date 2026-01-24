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
    // Get admin's division
    const adminInfo: any = await query(
      "SELECT division FROM users WHERE id = ?",
      [decoded.userId]
    )
    const adminDivision = adminInfo[0]?.division

    if (!adminDivision) {
      return NextResponse.json({ error: "Admin division not found" }, { status: 400 })
    }

    console.log(`[Admin Stats] Fetching stats for admin division: ${adminDivision}`)

    // Total tickets related to admin's division
    // Tickets from users in admin's division OR targeted to admin's division
    const totalTickets = await query(
      `SELECT COUNT(DISTINCT t.id) as count
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE u.division = ?
          OR JSON_CONTAINS(t.target_divisions, JSON_QUOTE(?))`,
      [adminDivision, adminDivision]
    )
    const totalCount = (totalTickets as any)[0]?.count || 0

    // Tickets by status (filtered by division)
    const byStatus = await query(
      `SELECT t.status, COUNT(DISTINCT t.id) as count
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE u.division = ?
          OR JSON_CONTAINS(t.target_divisions, JSON_QUOTE(?))
       GROUP BY t.status`,
      [adminDivision, adminDivision]
    )

    // Tickets by category (filtered by division)
    const byCategory = await query(
      `SELECT t.nlp_category as category, COUNT(DISTINCT t.id) as count
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE (u.division = ? OR JSON_CONTAINS(t.target_divisions, JSON_QUOTE(?)))
         AND t.nlp_category IS NOT NULL
       GROUP BY t.nlp_category`,
      [adminDivision, adminDivision]
    )

    // Recent tickets (filtered by division)
    const recentTickets = await query(
      `SELECT DISTINCT t.id, t.title, t.status, t.nlp_category as category, t.created_at, u.name, u.division as divisi
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE u.division = ?
          OR JSON_CONTAINS(t.target_divisions, JSON_QUOTE(?))
       ORDER BY t.created_at DESC
       LIMIT 10`,
      [adminDivision, adminDivision]
    )

    // Auto-repair: Fix tickets with NULL/empty status
    if (Array.isArray(recentTickets)) {
      for (const t of recentTickets as any[]) {
        if (!t.status || t.status === '' || t.status === null) {
          console.log(`[Admin Stats] Ticket #${t.id} has NULL/empty status, checking comments...`)

          const latestStatusComment: any = await query(
            `SELECT new_status FROM ticket_comments
             WHERE ticket_id = ? AND new_status IS NOT NULL AND new_status != ''
             ORDER BY created_at DESC LIMIT 1`,
            [t.id]
          )

          if (Array.isArray(latestStatusComment) && latestStatusComment.length > 0) {
            const correctStatus = latestStatusComment[0].new_status
            console.log(`[Admin Stats] Found status "${correctStatus}" in comments for ticket #${t.id}, repairing...`)
            await query(`UPDATE tickets SET status = ? WHERE id = ?`, [correctStatus, t.id])
            t.status = correctStatus
          } else {
            console.log(`[Admin Stats] No status found in comments for ticket #${t.id}, defaulting to 'new'`)
            await query(`UPDATE tickets SET status = 'new' WHERE id = ?`, [t.id])
            t.status = 'new'
          }
        }
      }
    }

    // Total users in admin's division only
    const totalUsers = await query(
      "SELECT COUNT(*) as count FROM users WHERE division = ? AND role = 'user'",
      [adminDivision]
    )
    const userCount = (totalUsers as any)[0]?.count || 0

    return NextResponse.json({
      totalTickets: totalCount,
      totalUsers: userCount,
      byStatus: Array.isArray(byStatus) ? byStatus : [],
      byCategory: Array.isArray(byCategory) ? byCategory : [],
      recentTickets: Array.isArray(recentTickets) ? recentTickets : [],
      adminDivision: adminDivision // Include for reference
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
