import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { writeFile } from "fs/promises"
import path from "path"

// Helper function to create notification for ticket creator (user_notifications table)
async function notifyTicketCreator(
  ticketId: number,
  ticketCreatorId: number,
  ticketTitle: string,
  message: string,
  type: 'status_update' | 'admin_note' | 'admin_image' | 'ticket_resolved'
) {
  try {
    await query(
      `INSERT INTO user_notifications
       (id_user, id_ticket, ticket_title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [ticketCreatorId, ticketId, ticketTitle, message, type]
    )
    console.log(`[Notification] Created user notification for user ${ticketCreatorId}: ${type}`)
  } catch (error) {
    console.error('[Notification] Error creating user notification:', error)
  }
}

// Helper function to create notification for admins (notifications table)
async function notifyAdmins(
  ticketId: number,
  ticketCreatorId: number,
  ticketTitle: string,
  message: string,
  targetDivisions: string[]
) {
  try {
    // Get all admins from target divisions
    const admins: any = await query(
      `SELECT id, name, division FROM users
       WHERE role = 'admin' AND division IN (?) AND is_active = TRUE`,
      [targetDivisions]
    )

    // Also get super admins
    const superAdmins: any = await query(
      `SELECT id, name, division FROM users
       WHERE role = 'super_admin' AND is_active = TRUE`
    )

    const allAdmins = [...(Array.isArray(admins) ? admins : []), ...(Array.isArray(superAdmins) ? superAdmins : [])]

    for (const admin of allAdmins) {
      await query(
        `INSERT INTO notifications
         (id_admin, id_ticket, id_user, title, message, notification_reason, is_read)
         VALUES (?, ?, ?, ?, ?, 'nlp_category', FALSE)`,
        [admin.id, ticketId, ticketCreatorId, ticketTitle, message]
      )
      console.log(`[Notification] Created admin notification for ${admin.name} (${admin.division})`)
    }
  } catch (error) {
    console.error('[Notification] Error creating admin notifications:', error)
  }
}

// GET - Fetch all comments for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params
    const ticketId = parseInt(id)

    // Check if user has access to this ticket
    const tickets: any = await query(
      `SELECT t.*, u.division as user_division
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE t.id = ?`,
      [ticketId]
    )

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const ticket = tickets[0]

    // Access control based on target_divisions (JSON array)
    if (decoded.role === "user") {
      // User can see if:
      // 1. They created it
      // 2. It's targeted to their division (check in target_divisions JSON array)
      // 3. It's created FROM their division (by users in same division)
      const userInfo: any = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const userDivision = userInfo[0]?.division

      // Parse target_divisions JSON array
      let targetDivisions = []
      try {
        targetDivisions = JSON.parse(ticket.target_divisions || '[]')
      } catch (e) {
        console.error("Failed to parse target_divisions:", e)
      }

      const hasAccess = ticket.id_user === decoded.userId ||
                        targetDivisions.includes(userDivision) ||
                        ticket.user_division === userDivision

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied - ticket not accessible" }, { status: 403 })
      }
    } else if (decoded.role === "admin") {
      // Admin can see tickets:
      // 1. Targeted to their division (check in target_divisions JSON array)
      // 2. Created FROM their division
      const adminInfo: any = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const adminDivision = adminInfo[0]?.division

      // Parse target_divisions JSON array
      let targetDivisions = []
      try {
        targetDivisions = JSON.parse(ticket.target_divisions || '[]')
      } catch (e) {
        console.error("Failed to parse target_divisions:", e)
      }

      const hasAccess = targetDivisions.includes(adminDivision) ||
                        ticket.user_division === adminDivision

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied - ticket not for your division" }, { status: 403 })
      }
    }
    // Super admin can see all

    // Fetch comments with user information
    const comments = await query(
      `SELECT
        tc.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.division as user_division
      FROM ticket_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at ASC`,
      [ticketId]
    )

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST - Add a new comment/response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const ticketId = parseInt(id)

    // Check if user has access to this ticket
    const tickets: any = await query(
      `SELECT t.*, u.division as user_division
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE t.id = ?`,
      [ticketId]
    )

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const ticket = tickets[0]

    // Access control - same as GET
    if (decoded.role === "user") {
      const userInfo: any = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const userDivision = userInfo[0]?.division

      // Parse target_divisions JSON array
      let targetDivisions = []
      try {
        targetDivisions = JSON.parse(ticket.target_divisions || '[]')
      } catch (e) {
        console.error("Failed to parse target_divisions:", e)
      }

      const hasAccess = ticket.id_user === decoded.userId ||
                        targetDivisions.includes(userDivision) ||
                        ticket.user_division === userDivision

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied - ticket not accessible" }, { status: 403 })
      }
    } else if (decoded.role === "admin") {
      const adminInfo: any = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const adminDivision = adminInfo[0]?.division

      // Parse target_divisions JSON array
      let targetDivisions = []
      try {
        targetDivisions = JSON.parse(ticket.target_divisions || '[]')
      } catch (e) {
        console.error("Failed to parse target_divisions:", e)
      }

      const hasAccess = targetDivisions.includes(adminDivision) ||
                        ticket.user_division === adminDivision

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied - ticket not for your division" }, { status: 403 })
      }
    }

    const formData = await request.formData()
    const comment = formData.get("comment") as string
    const commentType = formData.get("commentType") as string || "comment"
    const oldStatus = formData.get("oldStatus") as string || null
    const newStatus = formData.get("newStatus") as string || null
    const attachment = formData.get("attachment") as File | null

    let attachmentPath = null

    // Handle file upload if present
    if (attachment && attachment.size > 0) {
      const bytes = await attachment.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const timestamp = Date.now()
      const safeFileName = attachment.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const fileName = `comment_${ticketId}_${timestamp}_${safeFileName}`
      const uploadDir = path.join(process.cwd(), "public", "uploads", "comments")

      // Create directory if it doesn't exist
      const fs = require('fs')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      attachmentPath = `/uploads/comments/${fileName}`
    }

    // Insert comment
    await query(
      `INSERT INTO ticket_comments
        (ticket_id, user_id, comment, comment_type, old_status, new_status, attachment_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ticketId, decoded.userId, comment, commentType, oldStatus, newStatus, attachmentPath]
    )

    // If status changed, update ticket status
    if (newStatus && commentType === "status_change") {
      await query(
        `UPDATE tickets SET status = ? WHERE id = ?`,
        [newStatus, ticketId]
      )
    }

    // Get commenter name for notification
    const commenterInfo: any = await query(
      `SELECT name, role FROM users WHERE id = ?`,
      [decoded.userId]
    )
    const commenterName = commenterInfo[0]?.name || 'Seseorang'
    const commenterRole = commenterInfo[0]?.role

    // Parse target divisions for notifications
    let targetDivisions: string[] = []
    try {
      targetDivisions = JSON.parse(ticket.target_divisions || '[]')
    } catch (e) {
      console.error("Failed to parse target_divisions:", e)
    }

    // Send notifications based on who commented
    if (commenterRole === 'admin' || commenterRole === 'super_admin') {
      // Admin/Super Admin merespons -> notifikasi ke pembuat tiket
      if (ticket.id_user !== decoded.userId) {
        if (commentType === "status_change" && newStatus) {
          const statusLabels: Record<string, string> = {
            'new': 'Baru',
            'in_progress': 'Sedang Diproses',
            'resolved': 'Selesai'
          }
          const newStatusLabel = statusLabels[newStatus] || newStatus

          const notifType = newStatus === 'resolved' ? 'ticket_resolved' : 'status_update'
          const message = newStatus === 'resolved'
            ? `Tiket Anda telah diselesaikan oleh ${commenterName}`
            : `Status tiket diubah menjadi "${newStatusLabel}" oleh ${commenterName}`

          await notifyTicketCreator(
            ticketId,
            ticket.id_user,
            ticket.title,
            message,
            notifType
          )
        } else if (commentType === "response" || commentType === "comment") {
          await notifyTicketCreator(
            ticketId,
            ticket.id_user,
            ticket.title,
            `${commenterName} merespons tiket Anda`,
            'admin_note'
          )
        }
      }
    } else if (commenterRole === 'user') {
      // User merespons -> notifikasi ke admin divisi tujuan
      const message = `${commenterName} merespons tiket "${ticket.title}"`
      await notifyAdmins(
        ticketId,
        ticket.id_user,
        ticket.title,
        message,
        targetDivisions
      )
    }

    // Fetch the created comment with user info
    const comments: any = await query(
      `SELECT
        tc.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.division as user_division
      FROM ticket_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at DESC
      LIMIT 1`,
      [ticketId]
    )

    return NextResponse.json({
      message: "Comment added successfully",
      comment: comments[0]
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    )
  }
}