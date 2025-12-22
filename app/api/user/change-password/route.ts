import { verifyToken, hashPassword, verifyPassword } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json()

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru harus minimal 6 karakter" }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Password tidak cocok" }, { status: 400 })
    }

    const userResult = await query("SELECT password FROM users WHERE id = ?", [decoded.userId])

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const isPasswordValid = await verifyPassword(currentPassword, userResult[0].password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password saat ini tidak valid" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(newPassword)
    await query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, decoded.userId])

    return NextResponse.json({ message: "Password berhasil diubah" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
