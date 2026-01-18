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
  console.log(`[Notification] Attempting to create notification:`, {
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
    console.log(`[Notification] SUCCESS - Created notification for user ${ticketCreatorId}: ${type}`, result)
  } catch (error) {
    console.error('[Notification] FAILED - Error creating notification:', error)
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

    // For admin, verify they can update tickets targeted to their division OR from their division
    if (decoded.role === "admin") {
      const adminInfo = await query("SELECT division FROM users WHERE id = ?", [decoded.userId])
      const adminDivision = (adminInfo as any)[0]?.division

      const ticketInfo = await query(
        `SELECT t.target_divisions, u.division as user_division FROM tickets t
         JOIN users u ON t.id_user = u.id
         WHERE t.id = ?`,
        [id]
      )

      if (!Array.isArray(ticketInfo) || ticketInfo.length === 0) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
      }

      const ticketData = (ticketInfo as any)[0]
      const ticketUserDivision = ticketData?.user_division

      // Parse target_divisions JSON array
      let targetDivisions: string[] = []
      try {
        targetDivisions = JSON.parse(ticketData?.target_divisions || '[]')
      } catch (e) {
        console.error("Failed to parse target_divisions:", e)
      }

      // Admin can update if ticket is targeted to their division OR from their division
      const hasAccess = targetDivisions.includes(adminDivision) || ticketUserDivision === adminDivision

      if (!hasAccess) {
        return NextResponse.json({ error: "You can only update tickets for your division" }, { status: 403 })
      }
    }

    // Check if ticket is already closed - prevent any updates
    const currentTicketInfo: any = await query(
      `SELECT status, id_user FROM tickets WHERE id = ?`,
      [id]
    )

    if (currentTicketInfo[0]?.status === "closed") {
      return NextResponse.json(
        { error: "Tiket sudah ditutup dan tidak dapat diubah lagi" },
        { status: 403 }
      )
    }

    // IMPORTANT: Only ticket creator can set status to "closed"
    // Admin/super_admin can only set status up to "resolved"
    if (status === "closed") {
      const ticketCreatorId = currentTicketInfo[0]?.id_user
      if (ticketCreatorId !== decoded.userId) {
        return NextResponse.json(
          { error: "Hanya pembuat ticket yang dapat menutup ticket ini" },
          { status: 403 }
        )
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
      `SELECT t.id_user, t.title, t.status as old_status
       FROM tickets t
       WHERE t.id = ?`,
      [id]
    )
    const ticket = ticketInfo[0]

    // Get admin name separately
    const adminInfo: any = await query(
      `SELECT name FROM users WHERE id = ?`,
      [decoded.userId]
    )
    const adminName = adminInfo[0]?.name || 'Admin'

    console.log(`[Ticket Update] Ticket info for notification:`, {
      ticketId: id,
      ticketInfo: ticket,
      adminName,
      updates: { status, category, imageAdminUrl, admin_notes }
    })

    await query(`UPDATE tickets SET ${updates.join(", ")} WHERE id = ?`, values)

    // Send notification to ticket creator
    if (ticket) {
      console.log(`[Ticket Update] Sending notifications to user ${ticket.id_user}`)

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
    } else {
      console.error(`[Ticket Update] ERROR - Ticket not found for id: ${id}`)
    }

    return NextResponse.json({ message: "Ticket updated" })
  } catch (error) {
    console.error("Update ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Only super_admin can delete tickets
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // Only super_admin can delete tickets
  if (decoded.role !== "super_admin") {
    return NextResponse.json(
      { error: "Hanya Super Admin yang dapat menghapus tiket" },
      { status: 403 }
    )
  }

  try {
    const { id } = await params

    // Check if ticket exists
    const ticketCheck: any = await query(
      `SELECT id, title FROM tickets WHERE id = ?`,
      [id]
    )

    if (!Array.isArray(ticketCheck) || ticketCheck.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const ticketTitle = ticketCheck[0].title

    // Delete related comments first (foreign key constraint)
    await query(`DELETE FROM ticket_comments WHERE ticket_id = ?`, [id])

    // Delete related notifications
    await query(`DELETE FROM user_notifications WHERE id_ticket = ?`, [id])
    await query(`DELETE FROM admin_notifications WHERE id_ticket = ?`, [id])

    // Delete the ticket
    await query(`DELETE FROM tickets WHERE id = ?`, [id])

    console.log(`[Ticket Delete] Super Admin ${decoded.userId} deleted ticket #${id}: ${ticketTitle}`)

    return NextResponse.json({
      message: "Tiket berhasil dihapus",
      deletedTicketId: id,
      deletedTicketTitle: ticketTitle
    })
  } catch (error) {
    console.error("Delete ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}