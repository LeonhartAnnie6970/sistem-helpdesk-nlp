export const runtime = "nodejs"

import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function POST(req: NextRequest) {
  try {
    // Accept either 'authorization' or 'Authorization' header formats
    const token = req.headers.get("authorization")?.replace("Bearer ", "") || req.headers.get("Authorization")?.split(" ")[1]
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
    const buffer = Buffer.from(bytes)

    // Sanitize filename
    const safeOriginal = (file.name || "uploaded").replace(/[^a-zA-Z0-9._-]/g, "_")
    const fileName = `profile-${decoded.userId}-${Date.now()}-${safeOriginal}`

    // Try upload to Vercel Blob first; if it fails, fall back to local storage
    let publicUrl: string | null = null
    let returnedFilename: string | null = null

    try {
      const blob = await put(fileName, buffer, {
        access: "public",
        contentType: file.type,
      })

      // blob.url is expected; handle variations defensively
      publicUrl = (blob as any).url || (blob as any).publicUrl || null
      returnedFilename = (blob as any).name || (blob as any).pathname || fileName
    } catch (uploadErr) {
      console.error("Vercel blob upload failed, falling back to local storage:", uploadErr)

      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles")
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        const localFilename = fileName
        const filePath = path.join(uploadsDir, localFilename)
        await writeFile(filePath, buffer)

        publicUrl = `/uploads/profiles/${localFilename}`
        returnedFilename = localFilename
      } catch (localErr) {
        console.error("Local fallback save failed:", localErr)
        throw localErr
      }
    }

    if (!publicUrl) {
      throw new Error("Upload did not return a public URL")
    }

    // Persist profile image URL
    await query("UPDATE users SET profile_image_url = ? WHERE id = ?", [publicUrl, decoded.userId])

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        url: publicUrl,
        filename: returnedFilename,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Profile image upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
