// app/api/tickets/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  try {
    const tickets = await query(
      `SELECT t.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.division as user_division
       FROM tickets t
       JOIN users u ON t.id_user = u.id
       WHERE t.id = ?`,
      [params.id]
    )

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const ticket = tickets[0] as any

    // Check authorization based on role
    if (decoded.role === "user") {
      // User can see if:
      // 1. They created it
      // 2. It's targeted to their division
      // 3. It's created FROM their division
      const userInfo: any = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const userDivision = userInfo[0]?.division

      const hasAccess = ticket.id_user === decoded.userId ||
                        ticket.target_division === userDivision ||
                        ticket.user_division === userDivision

      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden - ticket not accessible" }, { status: 403 })
      }
    } else if (decoded.role === "admin") {
      // Admin can see tickets:
      // 1. Targeted to their division
      // 2. Created FROM their division
      const adminInfo: any = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )
      const adminDivision = adminInfo[0]?.division

      const hasAccess = ticket.target_division === adminDivision ||
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  try {
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
        [params.id]
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

    values.push(params.id)

    await query(`UPDATE tickets SET ${updates.join(", ")} WHERE id = ?`, values)

    return NextResponse.json({ message: "Ticket updated" })
  } catch (error) {
    console.error("Update ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}