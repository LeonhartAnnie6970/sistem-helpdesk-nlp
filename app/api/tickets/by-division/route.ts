// app/api/tickets/by-division/route.ts (updated)

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

  const { searchParams } = new URL(request.url)
  const filterDivision = searchParams.get("division")

  try {
    let tickets

    if (decoded.role === "super_admin") {
      // Super admin: filter optional
      if (filterDivision) {
        tickets = await query(
          `SELECT 
            t.*,
            u.name,
            u.email,
            u.division AS user_division_name
          FROM tickets t
          JOIN users u ON t.id_user = u.id
          WHERE 
            t.user_division = ? 
            OR JSON_CONTAINS(t.target_divisions, ?, '$')
          ORDER BY t.created_at DESC`,
          [filterDivision, JSON.stringify(filterDivision)]
        )
      } else {
        tickets = await query(
          `SELECT 
            t.*,
            u.name,
            u.email,
            u.division AS user_division_name
          FROM tickets t
          JOIN users u ON t.id_user = u.id
          ORDER BY t.created_at DESC`
        )
      }
    } 
    
    else if (decoded.role === "admin") {
      const adminInfo = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const adminDivision = (adminInfo as any)[0]?.division

      if (!adminDivision) {
        return NextResponse.json({ error: "Admin division not found" }, { status: 404 })
      }

      // Admin: auto filter by their division
      tickets = await query(
        `SELECT 
          t.*,
          u.name,
          u.email,
          u.division AS user_division_name
        FROM tickets t
        JOIN users u ON t.id_user = u.id
        WHERE 
          t.user_division = ? 
          OR JSON_CONTAINS(t.target_divisions, ?, '$')
        ORDER BY t.created_at DESC`,
        [adminDivision, JSON.stringify(adminDivision)]
      )
    } 
    
    else {
      // User: only their tickets
      tickets = await query(
        `SELECT 
          t.*,
          u.name,
          u.email,
          u.division AS user_division_name
        FROM tickets t
        JOIN users u ON t.id_user = u.id
        WHERE t.id_user = ?
        ORDER BY t.created_at DESC`,
        [decoded.userId]
      )
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Get tickets by division error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}