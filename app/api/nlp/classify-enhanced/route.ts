import { type NextRequest, NextResponse } from "next/server"

const NLP_API_URL = process.env.NLP_API_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const nlpResponse = await fetch(`${NLP_API_URL}/classify-enhanced`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!nlpResponse.ok) {
      throw new Error("NLP service error")
    }

    const result = await nlpResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("NLP classification error:", error)
    return NextResponse.json({ error: "Classification failed" }, { status: 500 })
  }
}
