"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Clock, XCircle, Users, Ticket as TicketIcon } from "lucide-react"
import { TicketDetailModal } from "@/components/ticket-detail-modal"

interface Ticket {
  id: number
  title: string
  description: string
  divisi: string
  target_division: string
  status: string
  category: string
  image_user_url?: string
  catatan_admin?: string
  created_at: string
  name: string
  email: string
}

interface DivisionStats {
  division: string
  totalTickets: number
  newTickets: number
  inProgressTickets: number
  completedTickets: number
}

export function DivisionMonitoringDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [divisionStats, setDivisionStats] = useState<DivisionStats[]>([])
  const [selectedDivision, setSelectedDivision] = useState<string>("all")
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    calculateDivisionStats()
  }, [tickets])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tickets", {
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

  const calculateDivisionStats = () => {
    const divisionMap = new Map<string, DivisionStats>()

    tickets.forEach((ticket) => {
      const division = ticket.divisi || "Unknown"

      if (!divisionMap.has(division)) {
        divisionMap.set(division, {
          division,
          totalTickets: 0,
          newTickets: 0,
          inProgressTickets: 0,
          completedTickets: 0,
        })
      }

      const stats = divisionMap.get(division)!
      stats.totalTickets++

      switch (ticket.status?.toLowerCase()) {
        case "new":
          stats.newTickets++
          break
        case "in_progress":
          stats.inProgressTickets++
          break
        case "completed":
          stats.completedTickets++
          break
      }
    })

    setDivisionStats(Array.from(divisionMap.values()).sort((a, b) => b.totalTickets - a.totalTickets))
  }

  const handleOpenTicketDetail = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setIsTicketModalOpen(true)
  }

  const handleCloseTicketDetail = () => {
    setIsTicketModalOpen(false)
    setSelectedTicketId(null)
  }

  const handleTicketUpdate = () => {
    fetchTickets()
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const filteredTickets = selectedDivision === "all"
    ? tickets
    : tickets.filter(t => t.divisi === selectedDivision)

  if (loading) {
    return <div className="flex items-center justify-center p-8 text-black dark:text-white">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Division Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {divisionStats.map((stat) => (
          <Card key={stat.division} className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDivision(stat.division)}>
            <CardHeader className="pb-3 bg-white dark:bg-black">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-black dark:text-white">
                <Users className="w-4 h-4" />
                {stat.division}
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white dark:bg-black">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-black dark:text-white">{stat.totalTickets}</span>
                  <TicketIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600 dark:text-yellow-400">{stat.newTickets}</div>
                    <div className="text-gray-600 dark:text-gray-300">Baru</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{stat.inProgressTickets}</div>
                    <div className="text-gray-600 dark:text-gray-300">Proses</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400">{stat.completedTickets}</div>
                    <div className="text-gray-600 dark:text-gray-300">Selesai</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket List */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-black dark:text-white">Daftar Tiket</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {selectedDivision === "all"
                  ? `Menampilkan ${filteredTickets.length} tiket dari semua divisi`
                  : `Menampilkan ${filteredTickets.length} tiket dari divisi ${selectedDivision}`}
              </CardDescription>
            </div>
            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger className="w-48 bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                <SelectItem value="all" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Semua Divisi</SelectItem>
                {divisionStats.map((stat) => (
                  <SelectItem key={stat.division} value={stat.division} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                    {stat.division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          {filteredTickets.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Tidak ada tiket untuk divisi ini
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 bg-white dark:bg-black">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-black dark:text-white">{ticket.title}</h4>
                          {ticket.category && (
                            <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Dari: {ticket.name} ({ticket.divisi}) • {new Date(ticket.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            {ticket.status}
                          </span>
                        </Badge>
                        <Button
                          onClick={() => handleOpenTicketDetail(ticket.id)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Detail
                        </Button>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketDetail}
        ticketId={selectedTicketId}
        onUpdate={handleTicketUpdate}
      />
    </div>
  )
}