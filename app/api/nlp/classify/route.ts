import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

const NLP_API_URL = process.env.NLP_API_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Call Flask NLP API
    const nlpResponse = await fetch(`${NLP_API_URL}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!nlpResponse.ok) {
      return NextResponse.json({ error: "NLP classification failed" }, { status: 500 })
    }

    const nlpResult = await nlpResponse.json()

    return NextResponse.json(nlpResult)
  } catch (error) {
    console.error("NLP classify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
