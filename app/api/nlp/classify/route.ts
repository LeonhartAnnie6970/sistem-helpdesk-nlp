import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { classify, classifyUrgency } from "@/lib/nlp-classifier"

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

    const result = classify(text)
    const urgencyResult = classifyUrgency(text)
    return NextResponse.json({
      ...result,
      urgency: urgencyResult.urgency,
      urgency_confidence: urgencyResult.confidence,
      urgency_matched_keywords: urgencyResult.matched_keywords,
    })
  } catch (error) {
    console.error("NLP classify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
