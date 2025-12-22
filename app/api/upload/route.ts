// import { put } from "@vercel/blob"
// import { type NextRequest, NextResponse } from "next/server"
// import { verifyToken } from "@/lib/auth"

// export async function POST(request: NextRequest) {
//   const token = request.headers.get("authorization")?.replace("Bearer ", "")

//   if (!token) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const decoded = verifyToken(token)
//   if (!decoded) {
//     return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//   }

//   try {
//     const formData = await request.formData()
//     const file = formData.get("file") as File
//     const type = formData.get("type") as string

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 })
//     }

//     if (!type || !["user_report", "admin_resolution"].includes(type)) {
//       return NextResponse.json({ error: "Invalid upload type" }, { status: 400 })
//     }

//     // Validasi file adalah gambar
//     if (!file.type.startsWith("image/")) {
//       return NextResponse.json({ error: "File must be an image" }, { status: 400 })
//     }

//     // Validasi ukuran file (maksimal 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
//     }

//     // Upload ke Vercel Blob dengan nama yang unik
//     const timestamp = Date.now()
//     const fileName = `${type}_${decoded.userId}_${timestamp}_${file.name}`
    
//     const blob = await put(fileName, file, {
//       access: "public",
//     })

//     return NextResponse.json({
//       url: blob.url,
//       filename: file.name,
//       size: file.size,
//       type: file.type,
//     })
//   } catch (error) {
//     console.error("Upload error:", error)
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 })
//   }
// }

import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    // Decode token
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    const timestamp = Date.now()
    const fileName = `${type}_${decoded.userId}_${timestamp}_${file.name}`

    const uploadDir = path.join(process.cwd(), "public/uploads")
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 })
  }
}

