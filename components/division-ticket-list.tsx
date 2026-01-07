"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageIcon, Hash, MessageSquare, Users, Target } from "lucide-react"
import { TicketDetailModal } from "@/components/ticket-detail-modal"

interface Ticket {
  id: number
  title: string
  description: string
  category: string
  status: string
  target_division: string
  created_at: string
  user_name: string
  user_email: string
  user_role: string
  user_division: string
  image_path?: string
  comment_count: number
}

interface DivisionTicketListProps {
  refreshTrigger?: number
}

export function DivisionTicketList({ refreshTrigger }: DivisionTicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [userDivision, setUserDivision] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("role")
    const division = localStorage.getItem("division")
    setUserRole(role || "")
    setUserDivision(division || "")
    fetchTickets()
  }, [refreshTrigger])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch("/api/tickets/by-target-division", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setError("Failed to fetch tickets")
        return
      }

      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error("Error fetching tickets:", err)
      setError("An error occurred while fetching tickets")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500 text-white"
      case "in_progress":
        return "bg-yellow-500 text-white"
      case "resolved":
        return "bg-green-500 text-white"
      case "closed":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
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
      case "closed":
        return "Ditutup"
      default:
        return status
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
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
    fetchTickets()
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading tickets...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
  }

  if (tickets.length === 0) {
    return (
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardContent className="py-12 text-center">
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-300">
            {userRole === "admin"
              ? `Belum ada tiket yang ditujukan ke divisi ${userDivision}`
              : "Belum ada tiket"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
            <CardHeader className="bg-white dark:bg-black pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs border-gray-300 dark:border-gray-600 text-black dark:text-white">
                    <Hash className="w-3 h-3 mr-1" />
                    {ticket.id}
                  </Badge>
                  {getStatusBadge(ticket.status)}
                </div>
                {ticket.comment_count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {ticket.comment_count} Respons
                  </Badge>
                )}
              </div>

              <CardTitle className="text-lg text-black dark:text-white mb-2">
                {ticket.title}
              </CardTitle>

              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {ticket.user_name}
                  </span>
                  <Badge className={getRoleBadgeColor(ticket.user_role)} variant="secondary">
                    {ticket.user_role === "super_admin" ? "Super Admin" :
                     ticket.user_role === "admin" ? "Admin" : "User"}
                  </Badge>
                </div>
                {ticket.user_division && (
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                    Dari: {ticket.user_division}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20">
                  <Target className="w-3 h-3 mr-1" />
                  Ke: {ticket.target_division}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="bg-white dark:bg-black">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {ticket.description}
              </p>

              {ticket.image_path && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <ImageIcon size={14} />
                    Lampiran:
                  </p>
                  <img
                    src={ticket.image_path}
                    alt="Ticket attachment"
                    className="max-w-full max-h-32 rounded border border-gray-200 dark:border-gray-700 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                {ticket.category && (
                  <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-black dark:text-white">
                    {ticket.category}
                  </Badge>
                )}
                <span>{new Date(ticket.created_at).toLocaleDateString("id-ID", {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>

              <Button
                onClick={() => handleOpenTicket(ticket.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Lihat Detail & Tanggapi
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <TicketDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ticketId={selectedTicketId}
        onUpdate={handleTicketUpdate}
      />
    </>
  )

  function getStatusBadge(status: string) {
    return (
      <Badge className={getStatusColor(status)}>
        {getStatusLabel(status)}
      </Badge>
    )
  }
}
