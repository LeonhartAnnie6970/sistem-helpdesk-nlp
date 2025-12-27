import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withSuperAdminAuth } from "@/lib/middleware-rbac"
import { hashPassword } from "@/lib/auth"

async function handleGET(req: NextRequest) {
  try {
    const users = await query(
      `SELECT 
        id, 
        name, 
        email, 
        division, 
        role, 
        is_active,
        created_at, 
        last_login,
        profile_image_url 
       FROM users 
       ORDER BY 
        CASE role 
          WHEN 'super_admin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'user' THEN 3
        END,
        created_at DESC`
    )

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

async function handlePOST(req: NextRequest) {
  try {
    const { name, email, password, division, role } = await req.json()

    // Validation
    if (!name || !email || !password || !division || !role) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ 
        error: "Password must be at least 6 characters" 
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['user', 'admin', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await query(
      "SELECT id FROM users WHERE email = ?", 
      [email]
    )
    
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({ 
        error: "Email already exists" 
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Insert user
    const result = await query(
      `INSERT INTO users 
       (name, email, password, division, role, is_active) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [name, email, hashedPassword, division, role]
    )

    console.log(`[SuperAdmin] Created user: ${email} (${role})`)

    return NextResponse.json({
      message: "User created successfully",
      userId: (result as any).insertId
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ 
      error: "Failed to create user" 
    }, { status: 500 })
  }
}

async function handlePATCH(req: NextRequest) {
  try {
    const { userId, name, email, division, role, password } = await req.json()

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required" 
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await query(
      "SELECT id, email FROM users WHERE id = ?",
      [userId]
    )

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 })
    }

    const updates: string[] = []
    const values: any[] = []

    if (name) {
      updates.push("name = ?")
      values.push(name)
    }

    if (email) {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ 
          error: "Invalid email format" 
        }, { status: 400 })
      }

      // Check if new email already exists (for different user)
      const emailCheck = await query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      )

      if (Array.isArray(emailCheck) && emailCheck.length > 0) {
        return NextResponse.json({ 
          error: "Email already exists" 
        }, { status: 409 })
      }

      updates.push("email = ?")
      values.push(email)
    }

    if (division) {
      updates.push("division = ?")
      values.push(division)
    }

    if (role) {
      const validRoles = ['user', 'admin', 'super_admin']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ 
          error: "Invalid role" 
        }, { status: 400 })
      }
      updates.push("role = ?")
      values.push(role)
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ 
          error: "Password must be at least 6 characters" 
        }, { status: 400 })
      }
      const hashedPassword = await hashPassword(password)
      updates.push("password = ?")
      values.push(hashedPassword)
    }

    if (updates.length === 0) {
      return NextResponse.json({
        error: "No fields to update"
      }, { status: 400 })
    }

    values.push(userId)

    await query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    )

    console.log(`[SuperAdmin] Updated user ID: ${userId}`)

    return NextResponse.json({ 
      message: "User updated successfully" 
    })

  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ 
      error: "Failed to update user" 
    }, { status: 500 })
  }
}

async function handleDELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required" 
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await query(
      "SELECT id, email, role FROM users WHERE id = ?",
      [userId]
    )

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 })
    }

    const user = (existingUser as any)[0]

    // Prevent deleting the last super admin
    if (user.role === 'super_admin') {
      const superAdminCount = await query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'super_admin'"
      )
      
      if ((superAdminCount as any)[0]?.count <= 1) {
        return NextResponse.json({ 
          error: "Cannot delete the last super admin" 
        }, { status: 403 })
      }
    }

    // Soft delete (mark as inactive) or hard delete
    // For safety, we'll do soft delete
    await query(
      "UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?",
      [userId]
    )

    // If you want hard delete, use this instead:
    // await query("DELETE FROM users WHERE id = ?", [userId])

    console.log(`[SuperAdmin] Deleted user: ${user.email}`)

    return NextResponse.json({ 
      message: "User deleted successfully" 
    })

  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ 
      error: "Failed to delete user" 
    }, { status: 500 })
  }
}

export const GET = withSuperAdminAuth(handleGET)
export const POST = withSuperAdminAuth(handlePOST)
export const PATCH = withSuperAdminAuth(handlePATCH)
export const DELETE = withSuperAdminAuth(handleDELETE)