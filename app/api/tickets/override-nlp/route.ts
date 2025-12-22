import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PATCH(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // Only admin and super_admin can override NLP
  if (decoded.role !== "admin" && decoded.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { ticketId, newDivision, reason } = body

    if (!ticketId || !newDivision) {
      return NextResponse.json({ error: "Ticket ID and new division are required" }, { status: 400 })
    }

    // Get current ticket data
    const ticketData = await query("SELECT target_division FROM tickets WHERE id = ?", [ticketId])

    if (!ticketData || (ticketData as any[]).length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const currentDivision = (ticketData as any)[0].target_division

    // Update ticket with override
    await query(
      `UPDATE tickets 
       SET target_division = ?, 
           is_nlp_overridden = TRUE,
           original_nlp_division = ?,
           override_reason = ?,
           overridden_by = ?,
           overridden_at = NOW()
       WHERE id = ?`,
      [newDivision, currentDivision, reason || null, decoded.userId, ticketId],
    )

    return NextResponse.json({ message: "NLP result overridden successfully" })
  } catch (error) {
    console.error("Override NLP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
