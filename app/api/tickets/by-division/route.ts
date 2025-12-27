import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // Get division from query params
  const { searchParams } = new URL(request.url)
  const division = searchParams.get("division")

  try {
    let tickets

    if (decoded.role === "super_admin") {
      // Super admin can see all tickets, optionally filtered by division
      if (division) {
        tickets = await query(
          `SELECT t.*, u.name, u.email, u.division 
           FROM tickets t 
           JOIN users u ON t.id_user = u.id 
           WHERE t.target_division = ?
           ORDER BY t.created_at DESC`,
          [division],
        )
      } else {
        tickets = await query(
          `SELECT t.*, u.name, u.email, u.division 
           FROM tickets t 
           JOIN users u ON t.id_user = u.id 
           ORDER BY t.created_at DESC`,
        )
      }
    } else if (decoded.role === "admin") {
      // Admin can only see tickets assigned to their division
      const adminInfo = await query("SELECT division FROM users WHERE id = ?", [decoded.userId])
      const adminDivision = (adminInfo as any)[0]?.division

      if (!adminDivision) {
        return NextResponse.json({ error: "Admin division not found" }, { status: 404 })
      }

      tickets = await query(
        `SELECT t.*, u.name, u.email, u.division 
         FROM tickets t 
         JOIN users u ON t.id_user = u.id 
         WHERE t.target_division = ?
         ORDER BY t.created_at DESC`,
        [adminDivision],
      )
    } else {
      // User sees only their own tickets
      tickets = await query(
        `SELECT t.*, u.name, u.email, u.division
         FROM tickets t 
         JOIN users u ON t.id_user = u.id 
         WHERE t.id_user = ? 
         ORDER BY t.created_at DESC`,
        [decoded.userId],
      )
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Get tickets by division error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
