// app/api/admin/tickets/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role and division
    const profileResponse = await fetch(`${request.nextUrl.origin}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ error: "Failed to verify user" }, { status: 401 })
    }

    const userData = await profileResponse.json()
    const { role, divisi } = userData

    // Fetch tickets from backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const ticketsResponse = await fetch(`${backendUrl}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!ticketsResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }

    let tickets = await ticketsResponse.json()

    // Filter tickets based on role
    if (role === "super_admin") {
      // Super admin can see all tickets
      return NextResponse.json(tickets)
    } else if (role === "admin") {
      // Admin can only see tickets from their division
      const filteredTickets = tickets.filter(
        (ticket: any) => ticket.divisi?.toLowerCase() === divisi?.toLowerCase()
      )
      return NextResponse.json(filteredTickets)
    } else {
      // Regular users can only see their own tickets
      const userTickets = tickets.filter(
        (ticket: any) => ticket.user_id === userData.id
      )
      return NextResponse.json(userTickets)
    }
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}