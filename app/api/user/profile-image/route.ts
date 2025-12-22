import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

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

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File diperlukan" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const blob = await put(`profile-images/user-${decoded.userId}-${Date.now()}.${file.name.split(".").pop()}`, bytes, {
      access: "public",
    })

    await query("UPDATE users SET profile_image_url = ? WHERE id = ?", [blob.url, decoded.userId])

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Profile image upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
