"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, Hash } from "lucide-react"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { formatTicketId } from "@/lib/utils"

interface Ticket {
  id: number
  title: string
  description: string
  status: string
  created_at: string
  user_division: string
  user_division_name: string
  target_divisions: string
  nlp_category: string
  nlp_confidence: number
  name: string
  id_user: number
}

interface IncomingTicketsProps {
  refreshTrigger?: number
}

export function IncomingTickets({ refreshTrigger }: IncomingTicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userDivision, setUserDivision] = useState<string>("")

  useEffect(() => {
    fetchUserDivisionAndTickets()
  }, [refreshTrigger])

  const fetchUserDivisionAndTickets = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      // Get user profile to know their division
      const profileResponse = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })

      let currentUserDivision = ""
      if (profileResponse.ok) {
        const profile = await profileResponse.json()
        currentUserDivision = profile.division || ""
        setUserDivision(currentUserDivision)
      }

      console.log('[IncomingTickets] Fetching incoming tickets...')
      console.log('[IncomingTickets] Current user division:', currentUserDivision)

      const response = await fetch("/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('[IncomingTickets] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[IncomingTickets] Error response:', errorData)
        setError("Failed to fetch tickets")
        return
      }

      const data = await response.json()
      console.log('[IncomingTickets] All tickets received:', data)

      // Filter hanya ticket yang BUKAN dibuat oleh user ini (incoming)
      // Dan yang ditargetkan ke divisi user
      const userId = parseInt(localStorage.getItem("userId") || "0")

      console.log('[IncomingTickets] User ID:', userId)
      console.log('[IncomingTickets] User division:', currentUserDivision)
      console.log('[IncomingTickets] All tickets:', data)

      const incoming = Array.isArray(data) ? data.filter((t: any) => {
        // Ticket bukan dari user ini
        if (t.id_user === userId) {
          console.log('[IncomingTickets] Skipping ticket created by user:', t.id)
          return false
        }

        // Parse target_divisions
        let targetDivisions: string[] = []
        try {
          targetDivisions = JSON.parse(t.target_divisions || '[]')
        } catch (e) {
          console.error('[IncomingTickets] Failed to parse target_divisions for ticket:', t.id, e)
          return false
        }

        console.log('[IncomingTickets] Ticket', t.id, 'target_divisions:', targetDivisions)

        // Check if user's division is in target_divisions
        const isTargeted = targetDivisions.includes(currentUserDivision)

        console.log('[IncomingTickets] Ticket', t.id, 'targeted to user division?', isTargeted)

        return isTargeted
      }) : []

      console.log('[IncomingTickets] Incoming tickets count:', incoming.length)
      console.log('[IncomingTickets] Incoming tickets:', incoming)

      setTickets(incoming)

      // Jika ada highlightTicketId dari notifikasi, coba buka modal tiket tersebut
      try {
        const rawHighlight = localStorage.getItem('highlightTicketId')
        if (rawHighlight) {
          const highlightId = Number(rawHighlight)
          if (!Number.isNaN(highlightId)) {
            const found = incoming.find((t: any) => Number(t.id) === highlightId)
            if (found) {
              setSelectedTicketId(highlightId)
              setIsModalOpen(true)
            } else {
              console.warn('[IncomingTickets] Highlight ticket id not found in incoming tickets:', highlightId)
            }
          }
          localStorage.removeItem('highlightTicketId')
        }
      } catch (e) {
        console.error('[IncomingTickets] Error handling highlightTicketId:', e)
      }
    } catch (err) {
      console.error('[IncomingTickets] Fetch error:', err)
      setError("An error occurred while fetching tickets")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Baru"
      case "in_progress":
        return "Diproses"
      case "resolved":
        return "Selesai"
      default:
        return status
    }
  }

  const parseTargetDivisions = (targetDivisions: string): string[] => {
    try {
      return JSON.parse(targetDivisions || '[]')
    } catch (e) {
      return []
    }
  }

  const handleOpenTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTicketId(null)
  }

  const handleTicketUpdate = () => {
    fetchUserDivisionAndTickets()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600 dark:text-gray-300">Loading incoming tickets...</div>
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
        <ArrowDownLeft className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">Belum ada ticket masuk</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ticket dari divisi lain akan muncul di sini
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
                      {formatTicketId(ticket.id, ticket.user_division || ticket.user_division_name)}
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
                <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Pembuat Ticket */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[100px]">
                    Dari:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {ticket.name}
                  </span>
                </div>

                {/* Divisi Pembuat */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[100px]">
                    Dari Divisi:
                  </span>
                  <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    {ticket.user_division || ticket.user_division_name}
                  </Badge>
                </div>

                {/* Divisi Tujuan */}
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[100px]">
                    Ke Divisi:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {targetDivisions
                      .filter(division => division !== (ticket.user_division || ticket.user_division_name))
                      .map((division, idx) => (
                        <Badge
                          key={idx}
                          className={division === userDivision ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ring-2 ring-green-500" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"}
                        >
                          {division}
                          {division === userDivision && " (Anda)"}
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
