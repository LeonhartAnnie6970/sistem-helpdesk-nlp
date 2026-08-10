import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import {
  getTicketRoutingDivisions,
  createTicketNotifications,
  createOriginApprovalRequestNotifications
} from "@/lib/ticket-routing"
import { classify, classifyUrgency } from "@/lib/nlp-classifier"
import { getSlaHours, isValidUrgency } from "@/lib/urgency"


// app/api/tickets/route.ts (GET method - updated)

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

    // 🔴 SUPER ADMIN → lihat semua ticket
    if (decoded.role === "super_admin") {
      tickets = await query(`
        SELECT
          t.*, (SELECT COUNT(*) FROM tickets t2 WHERE t2.id <= t.id) AS ticket_sequence,
          u.name,
          u.email,
          u.division AS user_division_name
        FROM tickets t
        JOIN users u ON t.id_user = u.id
        ORDER BY t.created_at DESC
      `)

      // Auto-repair: Fix tickets with NULL/empty status by checking comments history
      if (Array.isArray(tickets)) {
        for (const t of tickets as any[]) {
          if (!t.status || t.status === '' || t.status === null) {
            console.log(`[GET /api/tickets] WARNING - Ticket #${t.id} has NULL/empty status, checking comments...`)

            // Check comments for the latest status
            const latestStatusComment: any = await query(
              `SELECT new_status FROM ticket_comments
               WHERE ticket_id = ? AND new_status IS NOT NULL AND new_status != ''
               ORDER BY created_at DESC LIMIT 1`,
              [t.id]
            )

            if (Array.isArray(latestStatusComment) && latestStatusComment.length > 0) {
              const correctStatus = latestStatusComment[0].new_status
              console.log(`[GET /api/tickets] Found status "${correctStatus}" in comments for ticket #${t.id}, repairing...`)

              // Update the ticket status in database
              await query(`UPDATE tickets SET status = ? WHERE id = ?`, [correctStatus, t.id])
              t.status = correctStatus // Update the response object too
            } else {
              // Default to 'new' if no status found in comments
              console.log(`[GET /api/tickets] No status found in comments for ticket #${t.id}, defaulting to 'new'`)
              await query(`UPDATE tickets SET status = 'new' WHERE id = ?`, [t.id])
              t.status = 'new'
            }
          }
        }
      }
    }

    // 🟠 ADMIN → lihat ticket berdasarkan:
    //    1. User division (ticket dari user di divisi yang sama)
    //    2. NLP category (ticket yang kategorinya match dengan divisi admin)
    else if (decoded.role === "admin") {
      // Get admin division
      const adminInfo = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )

      const adminDivision = (adminInfo as any)[0]?.division

      // Jika admin tidak punya division, tampilkan semua tiket (fallback)
      if (!adminDivision) {
        console.log('[GET /api/tickets] Admin has no division, showing all tickets')
        tickets = await query(
          `SELECT
            t.*, (SELECT COUNT(*) FROM tickets t2 WHERE t2.id <= t.id) AS ticket_sequence,
            u.name,
            u.email,
            u.division AS user_division_name
          FROM tickets t
          JOIN users u ON t.id_user = u.id
          ORDER BY t.created_at DESC`
        )
      } else {
        // Query dengan JSON_CONTAINS untuk cek target_divisions
        // Tiket lintas-divisi yang masih 'pending' approval hanya terlihat
        // oleh admin divisi ASAL (untuk approve/reject), belum oleh admin divisi tujuan
        tickets = await query(
          `SELECT
            t.*, (SELECT COUNT(*) FROM tickets t2 WHERE t2.id <= t.id) AS ticket_sequence,
            u.name,
            u.email,
            u.division AS user_division_name
          FROM tickets t
          JOIN users u ON t.id_user = u.id
          WHERE
            t.user_division = ?
            OR (JSON_CONTAINS(t.target_divisions, ?, '$') AND t.approval_status IN ('not_required', 'approved'))
          ORDER BY t.created_at DESC`,
          [adminDivision, JSON.stringify(adminDivision)]
        )
      }

      // Auto-repair: Fix tickets with NULL/empty status for admin
      if (Array.isArray(tickets)) {
        for (const t of tickets as any[]) {
          if (!t.status || t.status === '' || t.status === null) {
            console.log(`[GET /api/tickets] ADMIN - Ticket #${t.id} has NULL/empty status, checking comments...`)

            const latestStatusComment: any = await query(
              `SELECT new_status FROM ticket_comments
               WHERE ticket_id = ? AND new_status IS NOT NULL AND new_status != ''
               ORDER BY created_at DESC LIMIT 1`,
              [t.id]
            )

            if (Array.isArray(latestStatusComment) && latestStatusComment.length > 0) {
              const correctStatus = latestStatusComment[0].new_status
              console.log(`[GET /api/tickets] Found status "${correctStatus}" in comments for ticket #${t.id}, repairing...`)
              await query(`UPDATE tickets SET status = ? WHERE id = ?`, [correctStatus, t.id])
              t.status = correctStatus
            } else {
              console.log(`[GET /api/tickets] No status found in comments for ticket #${t.id}, defaulting to 'new'`)
              await query(`UPDATE tickets SET status = 'new' WHERE id = ?`, [t.id])
              t.status = 'new'
            }
          }
        }
      }
    }

    // 🟢 USER → lihat ticket sendiri DAN ticket yang ditargetkan ke divisinya
    else {
      console.log('[GET /api/tickets] Fetching tickets for user:', decoded.userId)

      // Get user division
      const userInfo = await query(
        "SELECT division FROM users WHERE id = ?",
        [decoded.userId]
      )

      const userDivision = (userInfo as any)[0]?.division

      // Jika user tidak punya division, hanya tampilkan ticket yang dibuat sendiri
      if (!userDivision) {
        console.log('[GET /api/tickets] User has no division, showing only own tickets')
        tickets = await query(
          `SELECT
            t.*, (SELECT COUNT(*) FROM tickets t2 WHERE t2.id <= t.id) AS ticket_sequence,
            u.name,
            u.email,
            u.division AS user_division_name
          FROM tickets t
          JOIN users u ON t.id_user = u.id
          WHERE t.id_user = ?
          ORDER BY t.created_at DESC`,
          [decoded.userId]
        )
      } else {
        // Query untuk mendapatkan:
        // 1. Ticket yang dibuat user sendiri
        // 2. Ticket yang ditargetkan ke divisi user (untuk incoming)
        // Tiket lintas-divisi yang masih 'pending' approval hanya terlihat oleh
        // rekan sedivisi (untuk transparansi), belum oleh divisi tujuan
        tickets = await query(
          `SELECT
            t.*, (SELECT COUNT(*) FROM tickets t2 WHERE t2.id <= t.id) AS ticket_sequence,
            u.name,
            u.email,
            u.division AS user_division_name
          FROM tickets t
          JOIN users u ON t.id_user = u.id
          WHERE t.id_user = ?
             OR (JSON_CONTAINS(t.target_divisions, ?, '$') AND (t.user_division = ? OR t.approval_status IN ('not_required', 'approved')))
          ORDER BY t.created_at DESC`,
          [decoded.userId, JSON.stringify(userDivision), userDivision]
        )

        console.log('[GET /api/tickets] User division:', userDivision)
      }

      // Auto-repair: Fix tickets with NULL/empty status for user
      if (Array.isArray(tickets)) {
        for (const t of tickets as any[]) {
          if (!t.status || t.status === '' || t.status === null) {
            console.log(`[GET /api/tickets] USER - Ticket #${t.id} has NULL/empty status, checking comments...`)

            const latestStatusComment: any = await query(
              `SELECT new_status FROM ticket_comments
               WHERE ticket_id = ? AND new_status IS NOT NULL AND new_status != ''
               ORDER BY created_at DESC LIMIT 1`,
              [t.id]
            )

            if (Array.isArray(latestStatusComment) && latestStatusComment.length > 0) {
              const correctStatus = latestStatusComment[0].new_status
              console.log(`[GET /api/tickets] Found status "${correctStatus}" in comments for ticket #${t.id}, repairing...`)
              await query(`UPDATE tickets SET status = ? WHERE id = ?`, [correctStatus, t.id])
              t.status = correctStatus
            } else {
              console.log(`[GET /api/tickets] No status found in comments for ticket #${t.id}, defaulting to 'new'`)
              await query(`UPDATE tickets SET status = 'new' WHERE id = ?`, [t.id])
              t.status = 'new'
            }
          }
        }
      }

      console.log('[GET /api/tickets] Tickets found:', Array.isArray(tickets) ? tickets.length : 0)
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Get tickets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get request body
    const contentType = request.headers.get("content-type") || ""
    let title: string
    let description: string
    let imageUserUrl: string | null = null
    let requestedUrgency: string | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      title = body.title
      description = body.description
      imageUserUrl = body.imageUserUrl || null
      requestedUrgency = body.urgency || null
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      title = formData.get("title") as string
      description = formData.get("description") as string
      imageUserUrl = formData.get("imageUserUrl") as string | null
      requestedUrgency = formData.get("urgency") as string | null
    } else {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 })
    }

    // Get user info
    const userInfo = await query(
      "SELECT name, division, role FROM users WHERE id = ?",
      [decoded.userId]
    )

    if (!userInfo || (userInfo as any[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = (userInfo as any)[0]
    const userDivision = user.division || 'GENERAL'
    const userName = user.name
    const creatorRole = user.role

    // NLP Classification
    let nlpCategory: string = 'General'
    let nlpConfidence: number = 0
    let nlpKeywords: string | null = null

    try {
      const nlpResult = classify(`${title} ${description}`)
      nlpCategory = nlpResult.category || 'General'
      nlpConfidence = typeof nlpResult.confidence === "number" ? nlpResult.confidence : 0
      if (nlpResult.matched_keywords && Array.isArray(nlpResult.matched_keywords)) {
        nlpKeywords = JSON.stringify(nlpResult.matched_keywords)
      }
    } catch (nlpError) {
      console.error("[Tickets] NLP classification error:", nlpError)
      // Continue dengan default category
    }

    // Urgency: pakai pilihan user kalau valid, kalau tidak fallback ke saran NLP
    let urgency: string = 'medium'
    try {
      if (requestedUrgency && isValidUrgency(requestedUrgency)) {
        urgency = requestedUrgency
      } else {
        urgency = classifyUrgency(`${title} ${description}`).urgency
      }
    } catch (urgencyError) {
      console.error("[Tickets] Urgency classification error:", urgencyError)
    }

    // Get routing divisions
    const routing = await getTicketRoutingDivisions(userDivision, nlpCategory)

    // Divisi tujuan selain divisi asal pembuat tiket -> lintas divisi
    const crossDivisionTargets = routing.nlpDivisions.filter(d => d !== userDivision)

    // Approval hanya berlaku untuk tiket dari role 'user' yang lintas divisi.
    // Tiket dibuat admin/super_admin, atau yang tidak lintas divisi, langsung jalan.
    const approvalStatus: 'pending' | 'not_required' =
      creatorRole === 'user' && crossDivisionTargets.length > 0 ? 'pending' : 'not_required'

    // Jam SLA baru mulai begitu tiket benar-benar jalan (tidak perlu approval,
    // atau langsung dari admin/super_admin). Kalau masih 'pending', deadline
    // baru dihitung nanti saat di-approve.
    // Dihitung pakai DATE_ADD(NOW(), ...) di SQL (bukan Date di JS) supaya
    // konsisten dengan timezone server DB - hindari selisih jam kalau
    // timezone server aplikasi & database berbeda.
    const isImmediate = approvalStatus === 'not_required'
    const slaHours = getSlaHours(urgency)

    console.log('[Tickets] Routing info:', {
      userId: decoded.userId,
      userDivision,
      nlpCategory,
      urgency,
      allDivisions: routing.allDivisions,
      approvalStatus
    })

    // Insert ticket dengan routing info
    const result = await query(
      `INSERT INTO tickets (
        id_user,
        title,
        description,
        image_user_url,
        user_division,
        nlp_category,
        target_divisions,
        nlp_confidence,
        nlp_keywords,
        urgency,
        deadline_at,
        status,
        approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${isImmediate ? 'DATE_ADD(NOW(), INTERVAL ? HOUR)' : 'NULL'}, 'new', ?)`,
      [
        decoded.userId,
        title,
        description,
        imageUserUrl,
        userDivision,
        nlpCategory,
        JSON.stringify(routing.allDivisions), // Save as JSON array
        nlpConfidence,
        nlpKeywords,
        urgency,
        ...(isImmediate ? [slaHours] : []),
        approvalStatus,
      ]
    )

    const ticketId = (result as any).insertId

    // Ambil deadline_at final untuk disertakan di response
    const deadlineRow: any = await query(`SELECT deadline_at FROM tickets WHERE id = ?`, [ticketId])
    const deadlineAt = deadlineRow?.[0]?.deadline_at ?? null

    // Create notifications untuk pihak yang relevan
    try {
      const notificationCount = approvalStatus === 'pending'
        ? await createOriginApprovalRequestNotifications(
            ticketId,
            decoded.userId,
            userDivision,
            nlpCategory,
            title,
            userName,
            crossDivisionTargets
          )
        : await createTicketNotifications(
            ticketId,
            decoded.userId,
            userDivision,
            nlpCategory,
            title,
            userName
          )

      console.log(`[Tickets] Created ticket ${ticketId} with ${notificationCount} notifications (approval: ${approvalStatus})`)
    } catch (notificationError) {
      console.error("[Tickets] Error creating notifications:", notificationError)
      // Don't fail ticket creation if notification fails
    }

    return NextResponse.json({
      message: "Ticket created",
      ticketId,
      routing: {
        userDivision,
        nlpCategory,
        targetDivisions: routing.allDivisions
      },
      approvalStatus,
      urgency,
      deadlineAt
    }, { status: 201 })

  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}