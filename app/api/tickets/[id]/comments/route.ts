import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { writeFile } from "fs/promises"
import path from "path"

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