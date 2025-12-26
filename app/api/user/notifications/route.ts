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

  try {
    // Get all notifications for user
    const notifications = await query(
      `SELECT * FROM user_notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [decoded.userId]
    )

    // Get unread count
    const unreadResult = await query(
      `SELECT COUNT(*) as count FROM user_notifications 
       WHERE user_id = ? AND is_read = FALSE`,
      [decoded.userId]
    )

    const unreadCount = (unreadResult as any)[0]?.count || 0

    return NextResponse.json({
      notifications: Array.isArray(notifications) ? notifications : [],
      unreadCount
    })
  } catch (error) {
    console.error("Get user notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  try {
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    // Verify notification belongs to user
    const notif = await query(
      "SELECT user_id FROM user_notifications WHERE id = ?",
      [notificationId]
    )

    if (!Array.isArray(notif) || notif.length === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if ((notif[0] as any).user_id !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Mark as read
    await query(
      "UPDATE user_notifications SET is_read = TRUE WHERE id = ?",
      [notificationId]
    )

    return NextResponse.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}