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
    // Get unread notifications count
    const unreadResult = await query(
      "SELECT COUNT(*) as count FROM notifications WHERE id_admin = ? AND is_read = FALSE",
      [decoded.userId],
    )

    // Get latest notifications (limit 10)
    const notifications = await query(
      `SELECT n.*, t.title as ticket_title, u.name as user_name, u.divisi 
       FROM notifications n
       JOIN tickets t ON n.id_ticket = t.id
       JOIN users u ON n.id_user = u.id
       WHERE n.id_admin = ?
       ORDER BY n.created_at DESC
       LIMIT 10`,
      [decoded.userId],
    )

    return NextResponse.json({
      unreadCount: (unreadResult as any)[0]?.count || 0,
      notifications: notifications || [],
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { notificationId } = body

    await query("UPDATE notifications SET is_read = TRUE WHERE id = ? AND id_admin = ?", [
      notificationId,
      decoded.userId,
    ])

    return NextResponse.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Update notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
