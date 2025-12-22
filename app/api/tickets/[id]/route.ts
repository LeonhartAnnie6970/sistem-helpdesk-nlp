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
      `SELECT t.*, u.name, u.email FROM tickets t 
       JOIN users u ON t.id_user = u.id 
       WHERE t.id = ?`,
      [params.id],
    )

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const ticket = tickets[0] as any

    // Check authorization
    if (decoded.role !== "admin" && ticket.id_user !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(ticket)
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

    const { status, category, imageAdminUrl } = bodyData

    // Only admin can update status, category, and images
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
