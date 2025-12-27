// // app/api/tickets/route.ts
// import { type NextRequest, NextResponse } from "next/server"
// import { query } from "@/lib/db"
// import { verifyToken } from "@/lib/auth"
// // import { sendNotificationEmail } from "@/lib/email.tsx"

// const NLP_API_URL = process.env.NLP_API_URL || "http://localhost:8000"

// export async function GET(request: NextRequest) {
//   const token = request.headers.get("authorization")?.replace("Bearer ", "")

//   if (!token) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const decoded = verifyToken(token)
//   if (!decoded) {
//     return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//   }

//   try {
//     let tickets

//     // 🔴 SUPER ADMIN → lihat semua
//     if (decoded.role === "super_admin") {
//       tickets = await query(`
//         SELECT t.*, u.name, u.email, u.division AS user_division
//         FROM tickets t
//         JOIN users u ON t.id_user = u.id
//         ORDER BY t.created_at DESC
//       `)
//     }

//     // 🟠 ADMIN → lihat ticket sesuai TARGET_DIVISION
//     else if (decoded.role === "admin") {
//       // Ambil divisi admin dari users
//       const adminInfo = await query(
//         "SELECT division FROM users WHERE id = ?",
//         [decoded.userId]
//       )

//       const adminDivision = (adminInfo as any)[0]?.division

//       if (!adminDivision) {
//         return NextResponse.json({ error: "Admin division not found" }, { status: 404 })
//       }

//       tickets = await query(
//         `
//         SELECT t.*, u.name, u.email, u.division AS user_division
//         FROM tickets t
//         JOIN users u ON t.id_user = u.id
//         WHERE t.target_division = ?
//         ORDER BY t.created_at DESC
//         `,
//         [adminDivision]
//       )
//     }

//     // 🟢 USER → lihat ticket sendiri
//     else {
//       tickets = await query(
//         `
//         SELECT t.*, u.name, u.email, u.division AS user_division
//         FROM tickets t
//         JOIN users u ON t.id_user = u.id
//         WHERE t.id_user = ?
//         ORDER BY t.created_at DESC
//         `,
//         [decoded.userId]
//       )
//     }

//     return NextResponse.json(tickets)
//   } catch (error) {
//     console.error("Get tickets error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


// export async function POST(request: NextRequest) {
//   try {
//   const token = request.headers.get("authorization")?.replace("Bearer ", "")

//   if (!token) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const decoded = verifyToken(token)
//   if (!decoded) {
//     return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//   }

  
//     const contentType = request.headers.get("content-type") || ""
//     let title: string
//     let description: string
//     let imageUserUrl: string | null = null

//     if (contentType.includes("application/json")) {
//       const body = await request.json()
//       title = body.title
//       description = body.description
//       imageUserUrl = body.imageUserUrl || null
//     } else if (contentType.includes("multipart/form-data")) {
//       const formData = await request.formData()
//       title = formData.get("title") as string
//       description = formData.get("description") as string
//       imageUserUrl = formData.get("imageUserUrl") as string | null
//     } else {
//       return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
//     }

//     if (!title || !description) {
//       return NextResponse.json({ error: "Title and description required" }, { status: 400 })
//     }

//     // Get user division
//     const userInfo = await query(
//   "SELECT name, division FROM users WHERE id = ?",
//   [decoded.userId]
// )

// const user = (userInfo as any)[0]
// const userDivision = user.division

// let category : string | null = null
// let targetDivision : string = userDivision
// let nlpConfidence : number = 0
// let nlpKeywords : string | null = null
// let originalNlpDivision : string | null = null

// try {
//    const nlpResponse = await fetch(`${NLP_API_URL}/classify`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ text: `${title} ${description}` }),
//   })

//   if (nlpResponse.ok) {
//     const nlpResult = await nlpResponse.json()

//     category = nlpResult.category ?? null
//     targetDivision = nlpResult.division ?? userDivision
//     originalNlpDivision = nlpResult.division ?? null
//     nlpConfidence = typeof nlpResult.confidence === "number" ? nlpResult.confidence : 0
//     nlpKeywords = nlpResult.keywords ? JSON.stringify(nlpResult.keywords) : null
//   }
// } catch (e) {
//   console.error("NLP error:", e)
// }


//     const result = await query(
//   `
//   INSERT INTO tickets (
//     id_user,
//     title,
//     description,
//     image_user_url,
//     category,
//     target_division,
//     original_nlp_division,
//     nlp_confidence,
//     nlp_keywords,
//     status
//   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
//   `,
//   [
//     decoded.userId,
//   title,
//   description,
//   imageUserUrl ?? null,
//   category ?? null,
//   targetDivision,
//   originalNlpDivision ?? null,
//   nlpConfidence ?? 0,
//   nlpKeywords ?? null
//   ]
// )

//     const ticketId = (result as any).insertId

//     try {
//       // Get admins from the same division as user
//       const admins = await query(
//         "SELECT id, name, email, notification_email FROM users WHERE role = 'admin' AND division = ?",
//         [targetDivision]
//       )
      
//       // Also get super admins
//       const superAdmins = await query(
//         "SELECT id, name, email, notification_email FROM users WHERE role = 'super_admin'"
//       )

//       const allAdmins = [...(admins as any[]), ...(superAdmins as any[])]
//       const user = (userInfo as any)[0]

//       // Create notification untuk setiap admin dan send email
//       for (const admin of allAdmins) {
//         await query(
//           "INSERT INTO notifications (id_admin, id_ticket, id_user, title, message, is_read) VALUES (?, ?, ?, ?, ?, ?)",
//           [admin.id, ticketId, decoded.userId, title, `Tiket baru dari ${user.name} (${userDivision})`, false]
//         )

//         // const notificationEmailTarget = admin.notification_email || admin.email
//         // await sendNotificationEmail(
//         //   notificationEmailTarget, 
//         //   admin.name, 
//         //   title, 
//         //   user.name, 
//         //   userDivision, 
//         //   ticketId
//         // )
//       }

//       console.log("[Tickets] Notifications created and emails sent for ticket", ticketId)
//     } catch (notificationError) {
//       console.error("[Tickets] Error creating notifications:", notificationError)
//     }

//     return NextResponse.json({ message: "Ticket created", ticketId }, { status: 201 })
//   } catch (error) {
//     console.error("Create ticket error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// app/api/tickets/route.ts (POST method only - updated)

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { 
  getTicketRoutingDivisions,
  createTicketNotifications 
} from "@/lib/ticket-routing"

const NLP_API_URL = process.env.NLP_API_URL || "http://localhost:8000"


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
          t.*,
          u.name,
          u.email,
          u.division AS user_division_name
        FROM tickets t
        JOIN users u ON t.id_user = u.id
        ORDER BY t.created_at DESC
      `)
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

      if (!adminDivision) {
        return NextResponse.json({ error: "Admin division not found" }, { status: 404 })
      }

      // Query dengan JSON_CONTAINS untuk cek target_divisions
      tickets = await query(
        `SELECT 
          t.*,
          u.name,
          u.email,
          u.division AS user_division_name
        FROM tickets t
        JOIN users u ON t.id_user = u.id
        WHERE 
          t.user_division = ? 
          OR JSON_CONTAINS(t.target_divisions, ?, '$')
        ORDER BY t.created_at DESC`,
        [adminDivision, JSON.stringify(adminDivision)]
      )
    }

    // 🟢 USER → lihat ticket sendiri
    else {
      tickets = await query(
        `SELECT 
          t.*,
          u.name,
          u.email,
          u.division AS user_division_name
        FROM tickets t
        JOIN users u ON t.id_user = u.id
        WHERE t.id_user = ?
        ORDER BY t.created_at DESC`,
        [decoded.userId]
      )
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

    if (contentType.includes("application/json")) {
      const body = await request.json()
      title = body.title
      description = body.description
      imageUserUrl = body.imageUserUrl || null
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      title = formData.get("title") as string
      description = formData.get("description") as string
      imageUserUrl = formData.get("imageUserUrl") as string | null
    } else {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 })
    }

    // Get user info
    const userInfo = await query(
      "SELECT name, division FROM users WHERE id = ?",
      [decoded.userId]
    )

    if (!userInfo || (userInfo as any[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = (userInfo as any)[0]
    const userDivision = user.division || 'GENERAL'
    const userName = user.name

    // NLP Classification
    let nlpCategory: string = 'General'
    let nlpConfidence: number = 0
    let nlpKeywords: string | null = null

    try {
      const nlpResponse = await fetch(`${NLP_API_URL}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title} ${description}` }),
      })

      if (nlpResponse.ok) {
        const nlpResult = await nlpResponse.json()
        nlpCategory = nlpResult.category || 'General'
        nlpConfidence = typeof nlpResult.confidence === "number" ? nlpResult.confidence : 0
        
        if (nlpResult.matched_keywords && Array.isArray(nlpResult.matched_keywords)) {
          nlpKeywords = JSON.stringify(nlpResult.matched_keywords)
        }
      }
    } catch (nlpError) {
      console.error("[Tickets] NLP classification error:", nlpError)
      // Continue dengan default category
    }

    // Get routing divisions
    const routing = await getTicketRoutingDivisions(userDivision, nlpCategory)

    console.log('[Tickets] Routing info:', {
      userId: decoded.userId,
      userDivision,
      nlpCategory,
      allDivisions: routing.allDivisions
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
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
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
      ]
    )

    const ticketId = (result as any).insertId

    // Create notifications untuk semua admin yang relevan
    try {
      const notificationCount = await createTicketNotifications(
        ticketId,
        decoded.userId,
        userDivision,
        nlpCategory,
        title,
        userName
      )

      console.log(`[Tickets] Created ticket ${ticketId} with ${notificationCount} notifications`)
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
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


