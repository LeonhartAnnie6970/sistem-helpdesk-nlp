import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { sendNotificationEmail } from "@/lib/email"

const NLP_API_URL = process.env.NLP_API_URL || "http://localhost:8000"

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
    let tickets

    if (decoded.role === "admin") {
      // Admin sees all tickets
      tickets = await query(
        `SELECT t.*, u.name, u.email, u.divisi FROM tickets t 
         JOIN users u ON t.id_user = u.id 
         ORDER BY t.created_at DESC`,
      )
    } else {
      // User sees only their tickets
      tickets = await query(
        `SELECT t.*, u.name, u.email, u.divisi FROM tickets t 
         JOIN users u ON t.id_user = u.id 
         WHERE t.id_user = ? 
         ORDER BY t.created_at DESC`,
        [decoded.userId],
      )
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Get tickets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const contentType = request.headers.get("content-type") || ""
    let title: string
    let description: string
    let imageUserUrl: string | null = null

    if (contentType.includes("application/json")) {
      // Old JSON format for backward compatibility
      const body = await request.json()
      title = body.title
      description = body.description
    } else if (contentType.includes("multipart/form-data")) {
      // New FormData format with optional image
      const formData = await request.formData()
      title = formData.get("title") as string
      description = formData.get("description") as string
      imageUserUrl = formData.get("imageUserUrl") as string
    } else {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 })
    }

    let category = null
    let targetDivision = "IT & Teknologi" // Default fallback
    try {
      const nlpResponse = await fetch(`${NLP_API_URL}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title} ${description}` }),
      })

      if (nlpResponse.ok) {
        const nlpResult = await nlpResponse.json()
        category = nlpResult.category
        
        // Map NLP category to target division
        // For now, use category as-is; you may need to map it properly
        const divisionMap: Record<string, string> = {
          "IT": "IT & Teknologi",
          "Finance": "ACC / FINANCE",
          "Finance/ACC": "ACC / FINANCE",
          "Operations": "OPERASIONAL",
          "Sales": "SALES",
          "Customer Service": "CUSTOMER SERVICE",
          "HR": "HR",
          "Management": "DIREKSI",
        }
        targetDivision = divisionMap[category] || "IT & Teknologi"
      }
    } catch (nlpError) {
      console.error("NLP classification error:", nlpError)
    }

    const result = await query(
      "INSERT INTO tickets (id_user, title, description, image_user_url, category, target_division, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [decoded.userId, title, description, imageUserUrl, category, targetDivision, "new"],
    )

    const ticketId = (result as any).insertId

    try {
      const admins = await query("SELECT id, name, email, notification_email FROM users WHERE role = 'admin'")
      const userInfo = await query("SELECT name, divisi FROM users WHERE id = ?", [decoded.userId])
      const user = (userInfo as any)[0]

      // Create notification untuk setiap admin dan send email
      for (const admin of admins as any[]) {
        // Insert notification ke database
        await query(
          "INSERT INTO notifications (id_admin, id_ticket, id_user, title, message, is_read) VALUES (?, ?, ?, ?, ?, ?)",
          [admin.id, ticketId, decoded.userId, title, `Tiket baru dari ${user.name}`, false],
        )

        const notificationEmailTarget = admin.notification_email || admin.email
        await sendNotificationEmail(notificationEmailTarget, admin.name, title, user.name, user.divisi, ticketId)
      }

      console.log("[v0] Notifications created and emails sent for ticket", ticketId)
    } catch (notificationError) {
      console.error("[v0] Error creating notifications:", notificationError)
      // Continue even if notification fails
    }

    return NextResponse.json({ message: "Ticket created", ticketId }, { status: 201 })
  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
