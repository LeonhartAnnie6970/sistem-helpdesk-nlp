import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded || (decoded.role !== "admin" && decoded.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "all"
  const division = searchParams.get("division")

  try {
    const whereConditions = []
    const params = []

    if (status !== "all") {
      whereConditions.push("t.status = ?")
      params.push(status)
    }

    if (division && division !== "all") {
      whereConditions.push("t.target_division = ?")
      params.push(division)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Get all tickets with NLP data
    const tickets = await query(
      `SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.category, 
        t.status, 
        t.target_division, 
        t.nlp_confidence, 
        t.nlp_keywords, 
        t.is_nlp_overridden, 
        t.original_nlp_division, 
        t.created_at, 
        u.name, 
        u.email, 
        u.divisi 
      FROM tickets t 
      JOIN users u ON t.id_user = u.id 
      ${whereClause}
      ORDER BY t.created_at DESC`,
      params,
    )

    // Calculate statistics
    const totalTickets = (tickets as any[]).length
    const highConfidence = (tickets as any[]).filter((t) => t.nlp_confidence && t.nlp_confidence >= 0.7).length
    const mediumConfidence = (tickets as any[]).filter(
      (t) => t.nlp_confidence && t.nlp_confidence >= 0.4 && t.nlp_confidence < 0.7,
    ).length
    const lowConfidence = (tickets as any[]).filter((t) => t.nlp_confidence && t.nlp_confidence < 0.4).length
    const overriddenCount = (tickets as any[]).filter((t) => t.is_nlp_overridden).length

    // Group by division
    const divisionStats: Record<string, any> = {}
    for (const ticket of tickets as any[]) {
      const div = ticket.target_division || "Unknown"
      if (!divisionStats[div]) {
        divisionStats[div] = {
          total: 0,
          new: 0,
          in_progress: 0,
          resolved: 0,
          avgConfidence: 0,
          confidenceSum: 0,
          confidenceCount: 0,
        }
      }
      divisionStats[div].total++
      divisionStats[div][
        ticket.status === "new" ? "new" : ticket.status === "in_progress" ? "in_progress" : "resolved"
      ]++

      if (ticket.nlp_confidence) {
        divisionStats[div].confidenceSum += ticket.nlp_confidence
        divisionStats[div].confidenceCount++
      }
    }

    // Calculate average confidence
    for (const div in divisionStats) {
      if (divisionStats[div].confidenceCount > 0) {
        divisionStats[div].avgConfidence = divisionStats[div].confidenceSum / divisionStats[div].confidenceCount
      }
    }

    return NextResponse.json({
      summary: {
        totalTickets,
        highConfidence,
        mediumConfidence,
        lowConfidence,
        overriddenCount,
      },
      divisionStats,
      tickets,
    })
  } catch (error) {
    console.error("Error generating NLP analysis report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
