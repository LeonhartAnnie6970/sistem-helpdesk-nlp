"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Ticket {
  id: number
  title: string
  description: string
  category: string
  status: string
  created_at: string
  name: string
  divisi?: string
}

interface TicketListProps {
  refreshTrigger?: number
}

export function TicketList({ refreshTrigger }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTickets()
  }, [refreshTrigger])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  if (tickets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Belum ada tiket</div>
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{ticket.title}</CardTitle>
                <div className="flex gap-2 items-center mt-1">
                  <CardDescription>{ticket.name}</CardDescription>
                  {ticket.divisi && (
                    <Badge variant="secondary" className="text-xs">
                      {ticket.divisi}
                    </Badge>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {ticket.category && <Badge variant="outline">{ticket.category}</Badge>}
              <span>{new Date(ticket.created_at).toLocaleDateString("id-ID")}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
