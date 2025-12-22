import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth"
import { isValidDivision } from "@/lib/divisions"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, divisi } = await request.json()

    if (!name || !email || !password || !divisi) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!isValidDivision(divisi)) {
      return NextResponse.json({ error: "Invalid division selected" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [email])
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const result = await query("INSERT INTO users (name, email, password, divisi, role) VALUES (?, ?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      divisi,
      "user",
    ])

    const userId = (result as any).insertId
    const token = generateToken(userId, "user")

    return NextResponse.json({ message: "User registered successfully", token, userId }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
