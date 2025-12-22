import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withSuperAdminAuth } from "@/lib/middleware-rbac"
import { hashPassword } from "@/lib/auth"

async function handleGET(req: NextRequest) {
  try {
    const users = await query(
      `SELECT id, name, email, divisi, role, created_at, profile_image_url 
       FROM users 
       ORDER BY created_at DESC`,
    )

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

async function handlePOST(req: NextRequest) {
  try {
    const { name, email, password, divisi, role } = await req.json()

    if (!name || !email || !password || !divisi || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [email])
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const result = await query("INSERT INTO users (name, email, password, divisi, role) VALUES (?, ?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      divisi,
      role,
    ])

    return NextResponse.json(
      { message: "User created successfully", userId: (result as any).insertId },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

async function handlePATCH(req: NextRequest) {
  try {
    const { userId, name, email, divisi, role, password } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updates: string[] = []
    const values: any[] = []

    if (name) {
      updates.push("name = ?")
      values.push(name)
    }
    if (email) {
      updates.push("email = ?")
      values.push(email)
    }
    if (divisi) {
      updates.push("divisi = ?")
      values.push(divisi)
    }
    if (role) {
      updates.push("role = ?")
      values.push(role)
    }
    if (password) {
      const hashedPassword = await hashPassword(password)
      updates.push("password = ?")
      values.push(hashedPassword)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(userId)
    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

async function handleDELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    await query("DELETE FROM users WHERE id = ?", [userId])

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

export const GET = withSuperAdminAuth(handleGET)
export const POST = withSuperAdminAuth(handlePOST)
export const PATCH = withSuperAdminAuth(handlePATCH)
export const DELETE = withSuperAdminAuth(handleDELETE)
