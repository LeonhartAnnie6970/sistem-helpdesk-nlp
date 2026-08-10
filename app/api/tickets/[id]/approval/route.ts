// app/api/tickets/[id]/approval/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { createApprovalGrantedNotifications } from "@/lib/ticket-routing"
import { getSlaHours } from "@/lib/urgency"

// PATCH - Approve or reject a pending cross-division ticket
// Only the admin of the ticket's origin division (or a super_admin) may act.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  if (decoded.role !== "admin" && decoded.role !== "super_admin") {
    return NextResponse.json({ error: "Hanya admin yang dapat melakukan approval tiket" }, { status: 403 })
  }

  try {
    const { id } = await params
    const ticketId = parseInt(id)

    const body = await request.json()
    const action = body.action as "approve" | "reject"
    const reason = typeof body.reason === "string" ? body.reason.trim() : ""

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action harus 'approve' atau 'reject'" }, { status: 400 })
    }

    if (action === "reject" && !reason) {
      return NextResponse.json({ error: "Alasan penolakan wajib diisi" }, { status: 400 })
    }

    const ticketResult = await query(
      `SELECT t.id, t.id_user, t.title, t.approval_status, t.nlp_category, t.user_division, t.urgency
       FROM tickets t
       WHERE t.id = ?`,
      [ticketId]
    )

    if (!Array.isArray(ticketResult) || ticketResult.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const ticket = ticketResult[0] as any

    if (ticket.approval_status !== "pending") {
      return NextResponse.json(
        { error: "Tiket ini tidak sedang menunggu persetujuan" },
        { status: 400 }
      )
    }

    // Admin can only approve/reject tickets originating from their own division
    if (decoded.role === "admin") {
      const adminInfo = await query("SELECT division FROM users WHERE id = ?", [decoded.userId])
      const adminDivision = (adminInfo as any)[0]?.division

      if (adminDivision !== ticket.user_division) {
        return NextResponse.json(
          { error: "Hanya admin divisi asal tiket yang dapat menyetujui/menolak tiket ini" },
          { status: 403 }
        )
      }
    }

    const approverInfo = await query("SELECT name FROM users WHERE id = ?", [decoded.userId])
    const approverName = (approverInfo as any)[0]?.name || "Admin"

    if (action === "approve") {
      // Jam SLA baru mulai sekarang - tiket baru resmi diteruskan ke divisi tujuan.
      // deadline_at dihitung dari NOW() yang sama persis dengan approved_at (satu
      // statement SQL) supaya tidak ada selisih timezone antara JS dan DB server.
      const slaHours = getSlaHours(ticket.urgency)

      await query(
        `UPDATE tickets SET approval_status = 'approved', approved_by = ?, approved_at = NOW(), rejection_reason = NULL, deadline_at = DATE_ADD(NOW(), INTERVAL ? HOUR) WHERE id = ?`,
        [decoded.userId, slaHours, ticketId]
      )

      await createApprovalGrantedNotifications(
        ticketId,
        ticket.id_user,
        ticket.user_division,
        ticket.nlp_category,
        ticket.title,
        approverName
      )

      await query(
        `INSERT INTO user_notifications (id_user, id_ticket, ticket_title, message, type, is_read)
         VALUES (?, ?, ?, ?, 'ticket_approved', FALSE)`,
        [ticket.id_user, ticketId, ticket.title, `Tiket Anda telah disetujui oleh ${approverName} dan diteruskan ke divisi terkait.`]
      )

      return NextResponse.json({ message: "Tiket disetujui dan diteruskan ke divisi tujuan" })
    }

    // action === "reject"
    await query(
      `UPDATE tickets SET approval_status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ? WHERE id = ?`,
      [decoded.userId, reason, ticketId]
    )

    await query(
      `INSERT INTO user_notifications (id_user, id_ticket, ticket_title, message, type, is_read)
       VALUES (?, ?, ?, ?, 'ticket_rejected', FALSE)`,
      [ticket.id_user, ticketId, ticket.title, `Tiket Anda ditolak oleh ${approverName}. Alasan: ${reason}`]
    )

    return NextResponse.json({ message: "Tiket ditolak" })
  } catch (error) {
    console.error("Ticket approval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
