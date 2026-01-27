import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Find user with is_active check
    const users = await query("SELECT id, password, role, is_active FROM users WHERE email = ?", [email])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0] as any

    // Block inactive users (is_active = FALSE or 0)
    console.log(`[Login] User ${email} is_active from DB: ${user.is_active}`)

    if (!user.is_active || user.is_active === 0 || user.is_active === false) {
      console.log(`[Login] BLOCKED - User ${email} is inactive (is_active = ${user.is_active})`)
      return NextResponse.json({
        error: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator."
      }, { status: 403 })
    }

    const passwordMatch = await verifyPassword(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken(user.id, user.role)

    return NextResponse.json({ message: "Login successful", token, userId: user.id, role: user.role }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
