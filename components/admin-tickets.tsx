"use client"

import { useEffect, useState } from "react"
import { TicketImagesGalleryKelola } from "./ticket-images-gallery-kelola"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminTicketsByStatus } from "./admin-tickets-by-status"

interface Ticket {
  id: number
  title: string
  description: string
  category: string
  status: string
  created_at: string
  name: string
  image_user_url?: string
  image_admin_url?: string
  image_admin_uploaded_at?: string
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch("/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setError("Failed to fetch tickets")
        return
      }

      const data = await response.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch (err) {
      setError("An error occurred while fetching tickets")
    } finally {
      setIsLoading(false)
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
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)))
      }
    } catch (err) {
      console.error("Error updating ticket:", err)
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [ticketId]: false }))
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Kelola Tiket (Status)</TabsTrigger>
          <TabsTrigger value="gallery">Galeri Gambar</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <AdminTicketsByStatus tickets={tickets} onStatusUpdate={handleStatusUpdate} updatingStatus={updatingStatus} />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <TicketImagesGalleryKelola />
        </TabsContent>
      </Tabs>
    </div>
  )
}
