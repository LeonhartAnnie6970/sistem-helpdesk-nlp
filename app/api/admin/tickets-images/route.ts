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

    console.log(`[Admin Tickets Images] Fetching images for admin division: ${adminDivision}`)

    // Get tickets with images that are related to admin's division
    // Either from users in admin's division OR targeted to admin's division
    const tickets = await query(
      `SELECT DISTINCT
        t.id,
        t.title,
        t.status,
        t.nlp_category as category,
        t.created_at,
        t.image_user_url,
        t.description,
        t.user_division,
        u.name,
        u.division as user_division_name
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE (t.image_user_url IS NOT NULL AND t.image_user_url != '')
         AND (u.division = ? OR JSON_CONTAINS(t.target_divisions, JSON_QUOTE(?)))
       ORDER BY t.created_at DESC
       LIMIT 20`,
      [adminDivision, adminDivision]
    )

    console.log(`[Admin Tickets Images] Found ${Array.isArray(tickets) ? tickets.length : 0} tickets with images`)

    // Auto-repair: Fix tickets with NULL/empty status
    if (Array.isArray(tickets)) {
      for (const t of tickets as any[]) {
        if (!t.status || t.status === '' || t.status === null) {
          console.log(`[Admin Tickets Images] Ticket #${t.id} has NULL/empty status, checking comments...`)

          const latestStatusComment: any = await query(
            `SELECT new_status FROM ticket_comments
             WHERE ticket_id = ? AND new_status IS NOT NULL AND new_status != ''
             ORDER BY created_at DESC LIMIT 1`,
            [t.id]
          )

          if (Array.isArray(latestStatusComment) && latestStatusComment.length > 0) {
            const correctStatus = latestStatusComment[0].new_status
            console.log(`[Admin Tickets Images] Found status "${correctStatus}" in comments for ticket #${t.id}, repairing...`)
            await query(`UPDATE tickets SET status = ? WHERE id = ?`, [correctStatus, t.id])
            t.status = correctStatus
          } else {
            console.log(`[Admin Tickets Images] No status found in comments for ticket #${t.id}, defaulting to 'new'`)
            await query(`UPDATE tickets SET status = 'new' WHERE id = ?`, [t.id])
            t.status = 'new'
          }
        }
      }
    }

    return NextResponse.json({
      tickets: Array.isArray(tickets) ? tickets : [],
      adminDivision: adminDivision
    })
  } catch (error) {
    console.error("[Admin Tickets Images] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
