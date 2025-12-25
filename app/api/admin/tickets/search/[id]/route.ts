// app/api/admin/tickets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, catatan_admin } = body

    // Verify user is admin or super_admin
    const profileResponse = await fetch(`${request.nextUrl.origin}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ error: "Failed to verify user" }, { status: 401 })
    }

    const userData = await profileResponse.json()
    
    if (userData.role !== "admin" && userData.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update ticket in backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const updateResponse = await fetch(`${backendUrl}/api/tickets/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        catatan_admin,
      }),
    })

    if (!updateResponse.ok) {
      const error = await updateResponse.json()
      return NextResponse.json(
        { error: error.message || "Failed to update ticket" },
        { status: updateResponse.status }
      )
    }

    const updatedTicket = await updateResponse.json()
    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}