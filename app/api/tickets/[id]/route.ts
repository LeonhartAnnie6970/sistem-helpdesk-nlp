// app/api/tickets/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

// Helper function to create notification for ticket creator
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
    console.log(`[Notification] Created notification for user ${ticketCreatorId}: ${type}`)
  } catch (error) {
    console.error('[Notification] Error creating notification:', error)
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  try {
    const { id } = await params
    const tickets = await query(
      `SELECT t.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.division as user_division
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE t.id = ?`,
      [id]
    )

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const ticket = tickets[0] as any

    // Check authorization based on role
    if (decoded.role === "user") {
      // User can see if:
      // 1. They created it
      // 2. It's targeted to their division (check in target_divisions JSON array)
      // 3. It's created FROM their division
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
        return NextResponse.json({ error: "Forbidden - ticket not accessible" }, { status: 403 })
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
        return NextResponse.json({ error: "Forbidden - ticket not for your division" }, { status: 403 })
      }
    }
    // Super admin can see all

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error("Get ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  try {
    const { id } = await params
    const contentType = request.headers.get("content-type") || ""
    let bodyData: any

    if (contentType.includes("application/json")) {
      bodyData = await request.json()
    } else {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    const { status, category, imageAdminUrl, admin_notes } = bodyData

    // Only admin and super_admin can update tickets
    if (decoded.role !== "admin" && decoded.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // For admin, verify they can only update tickets from their division
    if (decoded.role === "admin") {
      const adminInfo = await query("SELECT division FROM users WHERE id = ?", [decoded.userId])
      const adminDivision = (adminInfo as any)[0]?.division

      const ticketInfo = await query(
        `SELECT u.division FROM tickets t
         JOIN users u ON t.id_user = u.id
         WHERE t.id = ?`,
        [id]
      )

      const ticketUserDivision = (ticketInfo as any)[0]?.division

      if (adminDivision !== ticketUserDivision) {
        return NextResponse.json({ error: "You can only update tickets from your division" }, { status: 403 })
      }
    }

    const updates = []
    const values = []

    if (status) {
      updates.push("status = ?")
      values.push(status)
    }
    if (category) {
      updates.push("category = ?")
      values.push(category)
    }
    if (imageAdminUrl) {
      updates.push("image_admin_url = ?")
      updates.push("image_admin_uploaded_at = NOW()")
      values.push(imageAdminUrl)
    }
    if (admin_notes !== undefined) {
      updates.push("admin_notes = ?")
      values.push(admin_notes)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    values.push(id)

    // Get ticket info before update for notification
    const ticketInfo: any = await query(
      `SELECT t.id_user, t.title, t.status as old_status, u.name as admin_name
       FROM tickets t
       JOIN users u ON u.id = ?
       WHERE t.id = ?`,
      [decoded.userId, id]
    )
    const ticket = ticketInfo[0]

    await query(`UPDATE tickets SET ${updates.join(", ")} WHERE id = ?`, values)

    // Send notification to ticket creator
    if (ticket) {
      const adminName = ticket.admin_name || 'Admin'

      if (status) {
        const statusLabels: Record<string, string> = {
          'new': 'Baru',
          'in_progress': 'Sedang Diproses',
          'resolved': 'Selesai'
        }
        const oldStatusLabel = statusLabels[ticket.old_status] || ticket.old_status
        const newStatusLabel = statusLabels[status] || status

        const notifType = status === 'resolved' ? 'ticket_resolved' : 'status_update'
        const message = status === 'resolved'
          ? `Tiket Anda telah diselesaikan oleh ${adminName}`
          : `Status tiket diubah dari "${oldStatusLabel}" menjadi "${newStatusLabel}" oleh ${adminName}`

        await notifyTicketCreator(
          parseInt(id as string),
          ticket.id_user,
          ticket.title,
          message,
          notifType
        )
      }

      if (admin_notes !== undefined) {
        await notifyTicketCreator(
          parseInt(id as string),
          ticket.id_user,
          ticket.title,
          `${adminName} menambahkan catatan pada tiket Anda`,
          'admin_note'
        )
      }

      if (imageAdminUrl) {
        await notifyTicketCreator(
          parseInt(id as string),
          ticket.id_user,
          ticket.title,
          `${adminName} menambahkan gambar pada tiket Anda`,
          'admin_image'
        )
      }
    }

    return NextResponse.json({ message: "Ticket updated" })
  } catch (error) {
    console.error("Update ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}