import { type NextRequest, NextResponse } from "next/server"
import { classify, getSuggestions } from "@/lib/nlp-classifier"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const result = classify(text)
    const suggestions = getSuggestions(text, 3)

    return NextResponse.json({ ...result, suggestions })
  } catch (error) {
    console.error("NLP classification error:", error)
    return NextResponse.json({ error: "Classification failed" }, { status: 500 })
  }
}
