import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

/**
 * GET /api/tickets/by-target-division
 * Returns tickets that are targeted to the user's division based on NLP prediction
 *
 * Access Control:
 * - User: See tickets they created OR tickets targeted to their division
 * - Admin: See all tickets targeted to their division
 * - Super Admin: See all tickets (optionally filter by division)
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filterDivision = searchParams.get("division")

  try {
    let tickets

    if (decoded.role === "super_admin") {
      // Super admin can see all tickets, optionally filter by division
      if (filterDivision) {
        tickets = await query(
          `SELECT
            t.*,
            u.name as user_name,
            u.email as user_email,
            u.role as user_role,
            u.division as user_division,
            (SELECT COUNT(*) FROM ticket_comments WHERE ticket_id = t.id) as comment_count
          FROM tickets t
          JOIN users u ON t.id_user = u.id
          WHERE JSON_CONTAINS(t.target_divisions, ?, '$')
          ORDER BY t.created_at DESC`,
          [JSON.stringify(filterDivision)]
        )
      } else {
        tickets = await query(
          `SELECT
            t.*,
            u.name as user_name,
            u.email as user_email,
            u.role as user_role,
            u.division as user_division,
            (SELECT COUNT(*) FROM ticket_comments WHERE ticket_id = t.id) as comment_count
          FROM tickets t
          JOIN users u ON t.id_user = u.id
          ORDER BY t.created_at DESC`
        )
      }
    }
    else if (decoded.role === "admin") {
      // Admin can see:
      // 1. Tickets targeted to their division (via target_divisions JSON array)
      // 2. Tickets created FROM their division (by users in same division)
      const adminInfo = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const adminDivision = (adminInfo as any)[0]?.division

      if (!adminDivision) {
        return NextResponse.json({ error: "Admin division not found" }, { status: 404 })
      }

      tickets = await query(
        `SELECT
          t.*,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role,
          u.division as user_division,
          (SELECT COUNT(*) FROM ticket_comments WHERE ticket_id = t.id) as comment_count
        FROM tickets t
        JOIN users u ON t.id_user = u.id
        WHERE JSON_CONTAINS(t.target_divisions, ?, '$') OR u.division = ?
        ORDER BY t.created_at DESC`,
        [JSON.stringify(adminDivision), adminDivision]
      )
    }
    else {
      // Regular user: see tickets:
      // 1. They created
      // 2. Targeted to their division (via target_divisions JSON array)
      // 3. Created FROM their division (by other users in same division)
      const userInfo = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const userDivision = (userInfo as any)[0]?.division

      tickets = await query(
        `SELECT
          t.*,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role,
          u.division as user_division,
          (SELECT COUNT(*) FROM ticket_comments WHERE ticket_id = t.id) as comment_count
        FROM tickets t
        JOIN users u ON t.id_user = u.id
        WHERE t.id_user = ? OR JSON_CONTAINS(t.target_divisions, ?, '$') OR u.division = ?
        ORDER BY t.created_at DESC`,
        [decoded.userId, JSON.stringify(userDivision), userDivision]
      )
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Get tickets by target division error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}