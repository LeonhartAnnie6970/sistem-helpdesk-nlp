import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

// Debug endpoint to test notification insert
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  try {
    // Test insert into user_notifications
    console.log("[Debug] Testing notification insert...")

    const testResult = await query(
      `INSERT INTO user_notifications
       (id_user, id_ticket, ticket_title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [decoded.userId, 1, "Test Notification", "Ini adalah test notifikasi", "status_update"]
    )

    console.log("[Debug] Insert result:", testResult)

    // Fetch recent notifications
    const notifications = await query(
      `SELECT * FROM user_notifications WHERE id_user = ? ORDER BY created_at DESC LIMIT 5`,
      [decoded.userId]
    )

    // Check table structure
    const tableStructure = await query(`DESCRIBE user_notifications`)

    return NextResponse.json({
      success: true,
      insertResult: testResult,
      recentNotifications: notifications,
      tableStructure: tableStructure
    })
  } catch (error: any) {
    console.error("[Debug] Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorSql: error.sql
    }, { status: 500 })
  }
}

// GET to check current notifications
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
    // Check table structure
    const tableStructure = await query(`DESCRIBE user_notifications`)

    // Get all notifications for this user
    const notifications = await query(
      `SELECT * FROM user_notifications WHERE id_user = ? ORDER BY created_at DESC`,
      [decoded.userId]
    )

    // Count total
    const countResult: any = await query(
      `SELECT COUNT(*) as total FROM user_notifications`
    )

    return NextResponse.json({
      userId: decoded.userId,
      tableStructure,
      notifications,
      totalNotifications: countResult[0]?.total
    })
  } catch (error: any) {
    console.error("[Debug] Error:", error)
    return NextResponse.json({
      error: error.message,
      errorCode: error.code
    }, { status: 500 })
  }
}
