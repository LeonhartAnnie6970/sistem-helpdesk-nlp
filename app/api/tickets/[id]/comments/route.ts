import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { writeFile } from "fs/promises"
import path from "path"

function parseTargetDivisions(value: string | null | undefined): string[] {
  if (!value) return []
  const t = value.trim()
  if (t.startsWith('[')) { try { return JSON.parse(t) } catch {} }
  return t.split(',').map((d) => d.trim()).filter(Boolean)
}

// Helper function to create notification for ticket creator (user_notifications table)
async function notifyTicketCreator(
  ticketId: number,
  ticketCreatorId: number,
  ticketTitle: string,
  message: string,
  type: 'status_update' | 'admin_note' | 'admin_image' | 'ticket_resolved'
) {
  console.log(`[Comment Notification] Attempting to create user notification:`, {
    ticketId,
    ticketCreatorId,
    ticketTitle,
    message,
    type
  })

  try {
    const result = await query(
      `INSERT INTO user_notifications
       (id_user, id_ticket, ticket_title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [ticketCreatorId, ticketId, ticketTitle, message, type]
    )
    console.log(`[Comment Notification] SUCCESS - Created user notification for user ${ticketCreatorId}: ${type}`, result)
  } catch (error) {
    console.error('[Comment Notification] FAILED - Error creating user notification:', error)
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
    console.log(`[notifyAdmins] Called with targetDivisions:`, targetDivisions)

    if (!targetDivisions || targetDivisions.length === 0) {
      console.log(`[notifyAdmins] No target divisions, skipping`)
      return
    }

    // Build placeholders for IN clause: (?, ?, ?)
    const placeholders = targetDivisions.map(() => '?').join(', ')

    // Get all admins from target divisions
    const admins: any = await query(
      `SELECT id, name, division FROM users
       WHERE role = 'admin' AND division IN (${placeholders}) AND is_active = TRUE`,
      targetDivisions
    )

    console.log(`[notifyAdmins] Found admins:`, admins)

    // Also get super admins
    const superAdmins: any = await query(
      `SELECT id, name, division FROM users
       WHERE role = 'super_admin' AND is_active = TRUE`
    )

    console.log(`[notifyAdmins] Found super admins:`, superAdmins)

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
        targetDivisions = parseTargetDivisions(ticket.target_divisions)
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
        targetDivisions = parseTargetDivisions(ticket.target_divisions)
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
  console.log("===========================================")
  console.log("[Comment POST] Request received!")
  console.log("===========================================")

  try {
    const { id } = await params
    console.log(`[Comment POST] Ticket ID: ${id}`)

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

    // Check if ticket is closed - prevent ANY updates on closed tickets
    if (ticket.status === "closed") {
      console.log(`[Comment POST] Rejected - ticket ${ticketId} is closed`)
      return NextResponse.json(
        { error: "Tiket sudah ditutup dan tidak dapat menerima tanggapan lagi" },
        { status: 403 }
      )
    }

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
        targetDivisions = parseTargetDivisions(ticket.target_divisions)
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
        targetDivisions = parseTargetDivisions(ticket.target_divisions)
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

    console.log(`[Comment POST] FormData parsed:`, {
      comment: comment?.substring(0, 50),
      commentType,
      oldStatus,
      newStatus,
      hasAttachment: !!attachment
    })

    // IMPORTANT: Only ticket creator can set status to "closed"
    // Admin/responder can only set status up to "resolved"
    if (newStatus === "closed" && ticket.id_user !== decoded.userId) {
      console.log(`[Comment POST] Rejected - only ticket creator can close ticket. Creator: ${ticket.id_user}, Current user: ${decoded.userId}`)
      return NextResponse.json(
        { error: "Hanya pembuat ticket yang dapat menutup ticket ini" },
        { status: 403 }
      )
    }

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

    // If status changed, update ticket status FIRST (before inserting comment)
    // This ensures the status is updated even if comment insert fails
    if (newStatus && commentType === "status_change") {
      console.log(`[Comment POST] Updating ticket ${ticketId} status from "${oldStatus}" to "${newStatus}"`)
      try {
        const updateResult = await query(
          `UPDATE tickets SET status = ? WHERE id = ?`,
          [newStatus, ticketId]
        )
        console.log(`[Comment POST] Status update result:`, updateResult)
      } catch (statusError) {
        console.error(`[Comment POST] CRITICAL - Failed to update ticket status:`, statusError)
        return NextResponse.json(
          { error: "Gagal memperbarui status tiket" },
          { status: 500 }
        )
      }
    }

    // Insert comment
    await query(
      `INSERT INTO ticket_comments
        (ticket_id, user_id, comment, comment_type, old_status, new_status, attachment_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ticketId, decoded.userId, comment, commentType, oldStatus, newStatus, attachmentPath]
    )

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
      targetDivisions = parseTargetDivisions(ticket.target_divisions)
    } catch (e) {
      console.error("Failed to parse target_divisions:", e)
    }

    // Send notifications based on who commented
    console.log(`[Comment] Notification check:`, {
      commenterRole,
      commenterName,
      ticketCreatorId: ticket.id_user,
      commenterId: decoded.userId,
      commentType,
      newStatus
    })

    if (commenterRole === 'admin' || commenterRole === 'super_admin') {
      // Admin/Super Admin merespons -> notifikasi ke pembuat tiket
      console.log(`[Comment] Admin/SuperAdmin commented. Checking if should notify ticket creator...`)
      console.log(`[Comment] ticket.id_user=${ticket.id_user} (type: ${typeof ticket.id_user}), decoded.userId=${decoded.userId} (type: ${typeof decoded.userId})`)
      console.log(`[Comment] Are they different? ${ticket.id_user !== decoded.userId}`)

      if (ticket.id_user !== decoded.userId) {
        console.log(`[Comment] Will notify ticket creator ${ticket.id_user}`)
        console.log(`[Comment] commentType=${commentType}, newStatus=${newStatus}`)

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
        } else {
          console.log(`[Comment] Skipped notification - commentType=${commentType} doesn't match status_change/response/comment`)
        }
      } else {
        console.log(`[Comment] Skipped notification - admin is the ticket creator`)
      }
    } else if (commenterRole === 'user') {
      // User merespons tiket
      console.log(`[Comment] User commented on ticket`)

      // 1. Notifikasi ke pembuat tiket (jika bukan diri sendiri)
      if (ticket.id_user !== decoded.userId) {
        console.log(`[Comment] Notifying ticket creator ${ticket.id_user}`)
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
        } else {
          await notifyTicketCreator(
            ticketId,
            ticket.id_user,
            ticket.title,
            `${commenterName} merespons tiket Anda`,
            'admin_note'
          )
        }
      }

      // 2. Notifikasi ke admin divisi tujuan dan super admin
      const adminMessage = commentType === "status_change" && newStatus
        ? `${commenterName} mengubah status tiket "${ticket.title}"`
        : `${commenterName} merespons tiket "${ticket.title}"`

      await notifyAdmins(
        ticketId,
        ticket.id_user,
        ticket.title,
        adminMessage,
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