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
    const ticketsWithImages = await query(
      `SELECT t.id, t.title, t.status, t.category, t.created_at, t.image_user_url, u.name 
       FROM tickets t 
       JOIN users u ON t.id_user = u.id 
       WHERE t.image_user_url IS NOT NULL AND t.image_user_url != ''
       ORDER BY t.created_at DESC`,
    )

    console.log("[v0] Query result for tickets with images:", ticketsWithImages)

    const allTicketsWithImages = await query(
      `SELECT t.id, t.title, t.status, t.category, t.created_at, t.image_user_url, t.image_admin_url, u.name 
       FROM tickets t 
       JOIN users u ON t.id_user = u.id 
       WHERE (t.image_user_url IS NOT NULL AND t.image_user_url != '') OR (t.image_admin_url IS NOT NULL AND t.image_admin_url != '')
       ORDER BY t.created_at DESC`,
    )

    return NextResponse.json({
      ticketsWithImages: Array.isArray(ticketsWithImages) ? ticketsWithImages : [],
      allTicketsWithImages: Array.isArray(allTicketsWithImages) ? allTicketsWithImages : [],
    })
  } catch (error) {
    console.error("[v0] Get tickets images error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
