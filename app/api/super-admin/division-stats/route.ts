import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withSuperAdminAuth } from "@/lib/middleware-rbac"

async function handler(request: NextRequest) {
  try {
    // Stats per divisi
    const divisionStats = await query(`
      SELECT 
        t.target_division as division,
        COUNT(*) as total_tickets,
        SUM(CASE WHEN t.status = 'new' THEN 1 ELSE 0 END) as new_tickets,
        SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN t.status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        AVG(t.nlp_confidence) as avg_confidence,
        SUM(CASE WHEN t.is_nlp_overridden = TRUE THEN 1 ELSE 0 END) as overridden_count
      FROM tickets t
      WHERE t.target_division IS NOT NULL
      GROUP BY t.target_division
      ORDER BY total_tickets DESC
    `)

    // Admin per divisi
    const adminsByDivision = await query(`
      SELECT divisi as division, COUNT(*) as admin_count
      FROM users
      WHERE role = 'admin'
      GROUP BY divisi
    `)

    // NLP accuracy metrics
    const nlpMetrics = await query(`
      SELECT 
        AVG(nlp_confidence) as overall_confidence,
        COUNT(CASE WHEN nlp_confidence >= 0.7 THEN 1 END) as high_confidence_count,
        COUNT(CASE WHEN nlp_confidence >= 0.4 AND nlp_confidence < 0.7 THEN 1 END) as medium_confidence_count,
        COUNT(CASE WHEN nlp_confidence < 0.4 THEN 1 END) as low_confidence_count,
        COUNT(CASE WHEN is_nlp_overridden = TRUE THEN 1 END) as total_overridden
      FROM tickets
      WHERE target_division IS NOT NULL
    `)

    // Recent activity across all divisions
    const recentActivity = await query(`
      SELECT 
        t.id,
        t.title,
        t.target_division,
        t.status,
        t.nlp_confidence,
        t.is_nlp_overridden,
        t.created_at,
        u.name as user_name,
        u.divisi as user_division
      FROM tickets t
      JOIN users u ON t.id_user = u.id
      ORDER BY t.created_at DESC
      LIMIT 20
    `)

    return NextResponse.json({
      divisionStats: Array.isArray(divisionStats) ? divisionStats : [],
      adminsByDivision: Array.isArray(adminsByDivision) ? adminsByDivision : [],
      nlpMetrics: Array.isArray(nlpMetrics) && nlpMetrics.length > 0 ? nlpMetrics[0] : {},
      recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
    })
  } catch (error) {
    console.error("Division stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withSuperAdminAuth(handler)
