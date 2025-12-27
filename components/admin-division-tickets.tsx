// components/admin-division-tickets.tsx (updated)

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Users,
  Building2,
  Tag
} from 'lucide-react'

interface Ticket {
  id: number
  title: string
  description: string
  status: string
  user_division: string
  nlp_category: string
  target_divisions: string // JSON string
  name: string // user name
  email: string
  created_at: string
  nlp_confidence: number
}

export function AdminDivisionTickets({ selectedTicketId }: { selectedTicketId?: number | null }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all") // user_division | nlp_category | all
  const [adminDivision, setAdminDivision] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const division = localStorage.getItem("division")
    
    if (division) {
      setAdminDivision(division)
    }

    fetchTickets()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tickets, statusFilter, sourceFilter])

  useEffect(() => {
    if (selectedTicketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === selectedTicketId)
      if (ticket) {
        setSelectedTicket(ticket)
      }
    }
  }, [selectedTicketId, tickets])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      
      // Parse target_divisions from JSON string
      const parsedTickets = data.map((ticket: any) => ({
        ...ticket,
        target_divisions: ticket.target_divisions 
          ? (typeof ticket.target_divisions === 'string' 
              ? ticket.target_divisions 
              : JSON.stringify(ticket.target_divisions))
          : '[]'
      }))
      
      setTickets(parsedTickets)
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = tickets

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    // Filter by source (why admin gets this ticket)
    if (sourceFilter !== "all" && adminDivision) {
      filtered = filtered.filter(ticket => {
        const targetDivs = JSON.parse(ticket.target_divisions || '[]')
        
        if (sourceFilter === "user_division") {
          return ticket.user_division === adminDivision
        } else if (sourceFilter === "nlp_category") {
          // Ticket yang masuk karena NLP category
          return targetDivs.includes(adminDivision) && ticket.user_division !== adminDivision
        }
        return true
      })
    }

    setFilteredTickets(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any; icon: any }> = {
      new: { label: "Baru", variant: "default", icon: AlertCircle },
      in_progress: { label: "Diproses", variant: "secondary", icon: Clock },
      resolved: { label: "Selesai", variant: "outline", icon: CheckCircle2 },
      closed: { label: "Ditutup", variant: "destructive", icon: XCircle },
    }

    const config = variants[status] || variants.new
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getTicketSource = (ticket: Ticket): "user_division" | "nlp_category" | "both" => {
    const targetDivs = JSON.parse(ticket.target_divisions || '[]')
    const fromUserDiv = ticket.user_division === adminDivision
    const fromNlpCat = targetDivs.includes(adminDivision) && ticket.user_division !== adminDivision

    if (fromUserDiv && fromNlpCat) return "both"
    if (fromUserDiv) return "user_division"
    if (fromNlpCat) return "nlp_category"
    return "user_division" // fallback
  }

  const stats = {
    total: filteredTickets.length,
    new: filteredTickets.filter(t => t.status === "new").length,
    inProgress: filteredTickets.filter(t => t.status === "in_progress").length,
    resolved: filteredTickets.filter(t => t.status === "resolved").length,
    fromUserDivision: filteredTickets.filter(t => t.user_division === adminDivision).length,
    fromNlpCategory: filteredTickets.filter(t => {
      const targetDivs = JSON.parse(t.target_divisions || '[]')
      return targetDivs.includes(adminDivision) && t.user_division !== adminDivision
    }).length
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading tickets...</div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="text-gray-600 dark:text-gray-300">Total Tiket</CardDescription>
            <CardTitle className="text-3xl text-black dark:text-white">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4" />
              Dari User Divisi
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.fromUserDivision}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Tag className="w-4 h-4" />
              Dari Kategori NLP
            </CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.fromNlpCategory}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="text-gray-600 dark:text-gray-300">Tiket Baru</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.new}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-black dark:text-white">Filter Tiket</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Filter berdasarkan status dan sumber</CardDescription>
            </div>
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 bg-white dark:bg-black">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Status</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                >
                  Semua
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "new" ? "default" : "outline"}
                  onClick={() => setStatusFilter("new")}
                >
                  Baru
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "in_progress" ? "default" : "outline"}
                  onClick={() => setStatusFilter("in_progress")}
                >
                  Diproses
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "resolved" ? "default" : "outline"}
                  onClick={() => setStatusFilter("resolved")}
                >
                  Selesai
                </Button>
              </div>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Sumber Tiket</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sourceFilter === "all" ? "default" : "outline"}
                  onClick={() => setSourceFilter("all")}
                >
                  Semua
                </Button>
                <Button
                  size="sm"
                  variant={sourceFilter === "user_division" ? "default" : "outline"}
                  onClick={() => setSourceFilter("user_division")}
                  className="gap-1"
                >
                  <Users className="w-4 h-4" />
                  User Divisi
                </Button>
                <Button
                  size="sm"
                  variant={sourceFilter === "nlp_category" ? "default" : "outline"}
                  onClick={() => setSourceFilter("nlp_category")}
                  className="gap-1"
                >
                  <Tag className="w-4 h-4" />
                  Kategori NLP
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <CardTitle className="text-black dark:text-white">Daftar Tiket ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                Tidak ada tiket ditemukan
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const source = getTicketSource(ticket)
                const targetDivs = JSON.parse(ticket.target_divisions || '[]')

                return (
                  <Card
                    key={ticket.id}
                    className={`cursor-pointer transition-all hover:shadow-md bg-white dark:bg-black border-gray-200 dark:border-gray-700 ${
                      selectedTicket?.id === ticket.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-4 bg-white dark:bg-black">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-black dark:text-white">{ticket.title}</h3>
                            {getStatusBadge(ticket.status)}
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {ticket.description}
                          </p>

                          <div className="flex flex-wrap gap-2 text-xs">
                            {/* User Info */}
                            <Badge variant="outline" className="gap-1">
                              <Users className="w-3 h-3" />
                              {ticket.name} ({ticket.user_division})
                            </Badge>

                            {/* NLP Category */}
                            <Badge variant="secondary" className="gap-1">
                              <Tag className="w-3 h-3" />
                              {ticket.nlp_category}
                            </Badge>

                            {/* Source Indicator */}
                            {source === "user_division" && (
                              <Badge variant="default" className="bg-blue-500">
                                Divisi User
                              </Badge>
                            )}
                            {source === "nlp_category" && (
                              <Badge variant="default" className="bg-purple-500">
                                Kategori NLP
                              </Badge>
                            )}
                            {source === "both" && (
                              <Badge variant="default" className="bg-green-500">
                                Divisi & Kategori
                              </Badge>
                            )}

                            {/* Target Divisions */}
                            {targetDivs.length > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <Building2 className="w-3 h-3" />
                                {targetDivs.join(", ")}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {new Date(ticket.created_at).toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Ticket Detail */}
      {selectedTicket && (
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-white dark:bg-black">
            <CardTitle className="text-black dark:text-white">Detail Tiket #{selectedTicket.id}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Informasi lengkap tiket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-white dark:bg-black">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-black dark:text-white">Status</label>
                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-black dark:text-white">User</label>
                <p className="text-sm mt-1 text-black dark:text-white">{selectedTicket.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{selectedTicket.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-black dark:text-white">Divisi User</label>
                <p className="text-sm mt-1 text-black dark:text-white">{selectedTicket.user_division}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-black dark:text-white">Kategori NLP</label>
                <p className="text-sm mt-1 text-black dark:text-white">{selectedTicket.nlp_category}</p>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-black dark:text-white">Target Divisions</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {JSON.parse(selectedTicket.target_divisions || '[]').map((div: string) => (
                    <Badge key={div} variant="outline" className="border-gray-300 dark:border-gray-600 text-black dark:text-white">{div}</Badge>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-black dark:text-white">Deskripsi</label>
                <p className="text-sm mt-1 whitespace-pre-wrap text-black dark:text-white">{selectedTicket.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}