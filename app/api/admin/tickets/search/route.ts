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
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get("q") || ""

    if (!searchQuery.trim()) {
      return NextResponse.json({ tickets: [] })
    }

    const tickets = await query(
      `SELECT t.id, t.title, t.description, t.category, t.status, t.created_at, t.image_user_url, t.image_admin_url, t.image_admin_uploaded_at, u.name, u.divisi
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE t.title LIKE ? 
          OR t.description LIKE ? 
          OR t.category LIKE ? 
          OR u.name LIKE ?
       ORDER BY t.created_at DESC`,
      [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`],
    )

    return NextResponse.json({ tickets: Array.isArray(tickets) ? tickets : [] })
  } catch (error) {
    console.error("Search tickets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
