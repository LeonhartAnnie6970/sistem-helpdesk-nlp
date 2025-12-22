import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const result = await query(
      "SELECT id, username, email, divisi, role, profile_image_url, notification_email, created_at FROM users WHERE id = ?",
      [decoded.userId]
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { username, profile_image_url, notification_email } = await req.json()

    // Validate input
    if (username && username.length < 3) {
      return NextResponse.json({ error: "Username harus minimal 3 karakter" }, { status: 400 })
    }

    if (notification_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(notification_email)) {
        return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 })
      }
    }

    const updates: string[] = []
    const values: (string | number)[] = []

    if (username) {
      updates.push("username = ?")
      values.push(username)
    }

    if (profile_image_url) {
      updates.push("profile_image_url = ?")
      values.push(profile_image_url)
    }

    if (notification_email !== undefined) {
      updates.push("notification_email = ?")
      values.push(notification_email)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk diupdate" }, { status: 400 })
    }

    values.push(decoded.userId)

    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)

    // Fetch updated profile
    const result = await query(
      "SELECT id, username, email, divisi, role, profile_image_url, notification_email, created_at FROM users WHERE id = ?",
      [decoded.userId]
    )

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
