// app/api/admin/category-mapping/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const mappings = await query(
      "SELECT * FROM category_division_mapping ORDER BY nlp_category, target_division"
    )
    return NextResponse.json(mappings)
  } catch (error) {
    console.error("Get mappings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { nlp_category, target_division } = body

    await query(
      "INSERT INTO category_division_mapping (nlp_category, target_division) VALUES (?, ?)",
      [nlp_category, target_division]
    )

    return NextResponse.json({ message: "Mapping created" }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: "Mapping already exists" }, { status: 409 })
    }
    console.error("Create mapping error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}