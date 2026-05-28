"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Hash } from "lucide-react"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { formatTicketId } from "@/lib/utils"

interface Ticket {
  id: number
  title: string
  description: string
  status: string
  created_at: string
  user_division: string
  target_divisions: string
  nlp_category: string
  nlp_confidence: number
}

interface OutgoingTicketsProps {
  refreshTrigger?: number
}

export function OutgoingTickets({ refreshTrigger }: OutgoingTicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchOutgoingTickets()
  }, [refreshTrigger])

  const fetchOutgoingTickets = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      console.log('[OutgoingTickets] Fetching outgoing tickets...')

      const response = await fetch("/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('[OutgoingTickets] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[OutgoingTickets] Error response:', errorData)
        setError("Failed to fetch tickets")
        return
      }

      const data = await response.json()
      console.log('[OutgoingTickets] Tickets received:', data)

      // Filter hanya ticket yang dibuat oleh user ini (outgoing)
      const userId = parseInt(localStorage.getItem("userId") || "0")
      const outgoing = Array.isArray(data) ? data.filter((t: any) => t.id_user === userId) : []

      console.log('[OutgoingTickets] Outgoing tickets count:', outgoing.length)

      setTickets(outgoing)
    } catch (err) {
      console.error('[OutgoingTickets] Fetch error:', err)
      setError("An error occurred while fetching tickets")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase().trim()
    switch (s) {
      case "new":
        return "bg-blue-500 text-white"
      case "in_progress":
        return "bg-yellow-500 text-white"
      case "resolved":
        return "bg-green-500 text-white"
      case "closed":
      case "ditutup":
        return "bg-gray-600 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  const getStatusLabel = (status: string) => {
    const s = (status || "").toLowerCase().trim()
    switch (s) {
      case "new":
        return "Baru"
      case "in_progress":
        return "Diproses"
      case "resolved":
        return "Selesai"
      case "closed":
      case "ditutup":
        return "Ditutup"
      default:
        return status || "Baru"
    }
  }

  const parseTargetDivisions = (targetDivisions: string | string[]): string[] => {
    if (!targetDivisions) return []
    if (Array.isArray(targetDivisions)) return targetDivisions
    const t = (targetDivisions as string).trim()
    if (t.startsWith(\'[\')) { try { return JSON.parse(t) } catch {} }
    return t.split(\',\').map((d) => d.trim()).filter(Boolean)
  }

  const handleOpenTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTicketId(null)
    // Refresh list when modal closes to get updated status
    fetchOutgoingTickets()
  }

  const handleTicketUpdate = () => {
    fetchOutgoingTickets()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600 dark:text-gray-300">Loading outgoing tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <ArrowUpRight className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">Belum ada ticket keluar</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ticket yang Anda buat akan muncul di sini
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const targetDivisions = parseTargetDivisions(ticket.target_divisions)

        return (
          <Card
            key={ticket.id}
            className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            onClick={() => handleOpenTicket(ticket.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                      {formatTicketId(ticket.id, ticket.user_division)}
                    </span>
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-black dark:text-white">
                    {ticket.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
                    {ticket.description.substring(0, 100)}
                    {ticket.description.length > 100 && "..."}
                  </CardDescription>
                </div>
                <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Divisi Pembuat */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[100px]">
                    Dari Divisi:
                  </span>
                  <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    {ticket.user_division}
                  </Badge>
                </div>

                {/* Divisi Tujuan */}
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[100px]">
                    Ke Divisi:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {targetDivisions
                      .filter(division => division !== ticket.user_division)
                      .map((division, idx) => (
                        <Badge
                          key={idx}
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {division}
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Kategori NLP */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[100px]">
                    Kategori:
                  </span>
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                    {ticket.nlp_category}
                  </Badge>
                  {ticket.nlp_confidence > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({Math.round(ticket.nlp_confidence * 100)}% confidence)
                    </span>
                  )}
                </div>

                {/* Waktu */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>
                    Dibuat: {new Date(ticket.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleTicketUpdate}
        />
      )}
    </div>
  )
}