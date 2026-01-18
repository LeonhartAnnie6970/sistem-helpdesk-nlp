import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// Debug endpoint to check database directly - no auth required for debugging
export async function GET(request: NextRequest) {
  try {
    // Check user_notifications table
    const userNotifications = await query(
      `SELECT * FROM user_notifications ORDER BY created_at DESC LIMIT 20`
    )

    // Check notifications table (admin)
    const adminNotifications = await query(
      `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20`
    )

    // Check table structure
    const tableStructure = await query(`DESCRIBE user_notifications`)

    // Count total
    const userNotifCount: any = await query(
      `SELECT COUNT(*) as total FROM user_notifications`
    )
    const adminNotifCount: any = await query(
      `SELECT COUNT(*) as total FROM notifications`
    )

    // Get recent tickets
    const recentTickets = await query(
      `SELECT id, id_user, title, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 5`
    )

    // Get users
    const users = await query(
      `SELECT id, name, email, role, division FROM users WHERE is_active = TRUE`
    )

    return NextResponse.json({
      userNotifications: {
        count: userNotifCount[0]?.total,
        data: userNotifications
      },
      adminNotifications: {
        count: adminNotifCount[0]?.total,
        data: adminNotifications
      },
      tableStructure,
      recentTickets,
      users
    })
  } catch (error: any) {
    console.error("[Debug] Error:", error)
    return NextResponse.json({
      error: error.message,
      errorCode: error.code
    }, { status: 500 })
  }
}

// Test insert notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ticketId } = body

    if (!userId || !ticketId) {
      return NextResponse.json({ error: "userId and ticketId required" }, { status: 400 })
    }

    console.log("[Debug] Testing insert with:", { userId, ticketId })

    // Test insert
    const result = await query(
      `INSERT INTO user_notifications
       (id_user, id_ticket, ticket_title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [userId, ticketId, "Test Notification", "Ini adalah test notifikasi manual", "status_update"]
    )

    console.log("[Debug] Insert result:", result)

    // Verify insert
    const check = await query(
      `SELECT * FROM user_notifications WHERE id_user = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    )

    return NextResponse.json({
      success: true,
      insertResult: result,
      verification: check
    })
  } catch (error: any) {
    console.error("[Debug] Insert error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorSqlState: error.sqlState
    }, { status: 500 })
  }
}
