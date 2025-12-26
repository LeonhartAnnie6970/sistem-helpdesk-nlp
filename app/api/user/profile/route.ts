import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db"
import { isValidDivision } from "@/lib/divisions"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const userId = decoded.userId
    if (!userId) return NextResponse.json({ error: "Invalid token payload" }, { status: 400 })

    const sql = `
      SELECT 
        id,
        name AS username,
        email,
        divisi,
        profile_image_url,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `
    const result = await query(sql, [userId])
    const rows = Array.isArray(result) ? result : []

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const userId = decoded.userId
    if (!userId) return NextResponse.json({ error: "Invalid token payload" }, { status: 400 })

    const body = await request.json()
    const { username, divisi } = body

    // Validation
    if (username && username.length < 3) {
      return NextResponse.json({ error: "Username harus minimal 3 karakter" }, { status: 400 })
    }

    if (divisi && !isValidDivision(divisi)) {
      return NextResponse.json({ error: "Divisi tidak valid" }, { status: 400 })
    }

    // Build update query
    const updates: string[] = []
    const values: any[] = []

    if (username) {
      updates.push("name = ?")
      values.push(username)
    }

    if (divisi) {
      updates.push("divisi = ?")
      values.push(divisi)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    values.push(userId)

    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)

    // Fetch updated profile
    const result = await query(
      `SELECT id, name AS username, email, divisi, profile_image_url, created_at FROM users WHERE id = ?`,
      [userId]
    )
    const rows = Array.isArray(result) ? result : []

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Profile PATCH error:", error)
    return NextResponse.json(
      { error: "Failed to update profile", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}