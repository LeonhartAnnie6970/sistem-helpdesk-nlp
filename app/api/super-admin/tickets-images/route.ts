import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withSuperAdminAuth } from "@/lib/middleware-rbac"

async function handler(_request: NextRequest) {
  try {
    console.log("[Super Admin Tickets Images] Fetching all tickets with images...")

    // Get ALL tickets with images (no division filter for super admin)
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
        t.target_divisions,
        (SELECT COUNT(*) FROM tickets t2 WHERE t2.id <= t.id) AS ticket_sequence,
        u.name,
        u.division as user_division_name
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE t.image_user_url IS NOT NULL AND t.image_user_url != ''
       ORDER BY t.created_at DESC
       LIMIT 50`
    )

    console.log(`[Super Admin Tickets Images] Found ${Array.isArray(tickets) ? tickets.length : 0} tickets with images`)

    // Auto-repair: Fix tickets with NULL/empty status
    if (Array.isArray(tickets)) {
      for (const t of tickets as any[]) {
        if (!t.status || t.status === '' || t.status === null) {
          console.log(`[Super Admin Tickets Images] Ticket #${t.id} has NULL/empty status, checking comments...`)

          const latestStatusComment: any = await query(
            `SELECT new_status FROM ticket_comments
             WHERE ticket_id = ? AND new_status IS NOT NULL AND new_status != ''
             ORDER BY created_at DESC LIMIT 1`,
            [t.id]
          )

          if (Array.isArray(latestStatusComment) && latestStatusComment.length > 0) {
            const correctStatus = latestStatusComment[0].new_status
            console.log(`[Super Admin Tickets Images] Found status "${correctStatus}" in comments for ticket #${t.id}, repairing...`)
            await query(`UPDATE tickets SET status = ? WHERE id = ?`, [correctStatus, t.id])
            t.status = correctStatus
          } else {
            console.log(`[Super Admin Tickets Images] No status found in comments for ticket #${t.id}, defaulting to 'new'`)
            await query(`UPDATE tickets SET status = 'new' WHERE id = ?`, [t.id])
            t.status = 'new'
          }
        }
      }
    }

    return NextResponse.json({
      tickets: Array.isArray(tickets) ? tickets : [],
      total: Array.isArray(tickets) ? tickets.length : 0
    })
  } catch (error) {
    console.error("[Super Admin Tickets Images] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withSuperAdminAuth(handler)
