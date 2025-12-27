"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface AdminTicketDetailProps {
  ticket: Ticket
  onStatusUpdate: (ticketId: number, newStatus: string) => Promise<void>
  isUpdating?: boolean
}

export function AdminTicketDetail({
  ticket,
  onStatusUpdate,
  isUpdating = false,
}: AdminTicketDetailProps) {
  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground">{ticket.name}</p>
          </div>
          <Badge variant="outline">
            {ticket.category || "Uncategorized"}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          {ticket.description}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Status:</span>
          <Select
            value={ticket.status}
            onValueChange={(value) =>
              onStatusUpdate(ticket.id, value)
            }
            disabled={isUpdating}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {isUpdating && (
            <span className="text-xs text-muted-foreground">
              Updating...
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {new Date(ticket.created_at).toLocaleString("id-ID")}
        </p>
      </CardContent>
    </Card>
  )
}
