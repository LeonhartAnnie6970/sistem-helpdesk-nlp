import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!type || !["user_report", "admin_resolution"].includes(type)) {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 })
    }

    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimum 5MB" }, { status: 400 })
    }

    const timestamp = Date.now()
    const originalFilename = file.name || "image"
    const safeFilename = originalFilename.replace(/\s+/g, "_")
    const blobFilename = `${type}_${decoded.userId}_${timestamp}_${safeFilename}`

    const blob = await put(blobFilename, file, { access: "public" })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: originalFilename,
    })

  } catch (error: any) {
    console.error("Upload error:", error?.message ?? error)
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 })
  }
}
