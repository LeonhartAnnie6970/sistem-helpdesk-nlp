"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { AdminTicketsByStatus } from "./admin-tickets-by-status"

interface Ticket {
  id: number
  title: string
  description: string
  category: string
  status: string
  created_at: string
  name: string
  divisi?: string
  target_division?: string
  nlp_confidence?: number
  image_user_url?: string
  image_admin_url?: string
}

interface AdminDivisionTicketsProps {
  userRole: string
  userDivision?: string
}

export function AdminDivisionTickets({ userRole, userDivision }: AdminDivisionTicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      const url =
        userRole === "admin" && userDivision
          ? `/api/tickets/by-division?division=${userDivision}`
          : "/api/tickets/by-division"

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    setUpdatingStatus((prev) => ({ ...prev, [ticketId]: true }))

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchTickets()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [ticketId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Tiket</h2>
          <p className="text-muted-foreground">
            {userRole === "admin" ? `Tiket divisi ${userDivision}` : "Semua tiket dari semua divisi"}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Total: {tickets.length} Tiket
        </Badge>
      </div>

      <AdminTicketsByStatus tickets={tickets} onStatusUpdate={handleStatusUpdate} updatingStatus={updatingStatus} />
    </div>
  )
}
