"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Users,
  Building2,
  Tag,
  Search
} from 'lucide-react'

interface Ticket {
  id: number
  title: string
  description: string
  status: string
  user_division: string
  nlp_category: string
  target_divisions: string
  name: string
  email: string
  created_at: string
  nlp_confidence: number
}

interface SuperAdminTicketsPanelProps {
  token: string
}

export function SuperAdminTicketsPanel({ token }: SuperAdminTicketsPanelProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDivision, setFilterDivision] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tickets, searchQuery, filterStatus, filterDivision, filterCategory])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets", {
        headers: { Authorization: `Bearer ${token}` }
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

  const applyFilters = () => {
    let filtered = [...tickets]

    // Search
    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status
    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus)
    }

    // Division
    if (filterDivision !== "all") {
      filtered = filtered.filter(t => t.user_division === filterDivision)
    }

    // Category
    if (filterCategory !== "all") {
      filtered = filtered.filter(t => t.nlp_category === filterCategory)
    }

    setFilteredTickets(filtered)
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: any; icon: any }> = {
      new: { label: "Baru", variant: "default", icon: AlertCircle },
      in_progress: { label: "Diproses", variant: "secondary", icon: Clock },
      resolved: { label: "Selesai", variant: "outline", icon: CheckCircle2 },
      closed: { label: "Ditutup", variant: "destructive", icon: XCircle },
    }

    const cfg = config[status] || config.new
    const Icon = cfg.icon

    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    )
  }

  const uniqueDivisions = Array.from(new Set(tickets.map(t => t.user_division).filter(Boolean)))
  const uniqueCategories = Array.from(new Set(tickets.map(t => t.nlp_category).filter(Boolean)))

  const stats = {
    total: filteredTickets.length,
    new: filteredTickets.filter(t => t.status === "new").length,
    inProgress: filteredTickets.filter(t => t.status === "in_progress").length,
    resolved: filteredTickets.filter(t => t.status === "resolved").length,
  }

  if (loading) {
    return <div className="p-8 text-center">Loading tickets...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Tickets</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>New</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.new}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDivision} onValueChange={setFilterDivision}>
              <SelectTrigger>
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {uniqueDivisions.map(div => (
                  <SelectItem key={div} value={div}>{div}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tickets found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map(ticket => {
                const targetDivs = JSON.parse(ticket.target_divisions || '[]')

                return (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{ticket.title}</h3>
                            {getStatusBadge(ticket.status)}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ticket.description}
                          </p>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className="gap-1">
                              <Users className="w-3 h-3" />
                              {ticket.name} ({ticket.user_division})
                            </Badge>

                            <Badge variant="secondary" className="gap-1">
                              <Tag className="w-3 h-3" />
                              {ticket.nlp_category}
                            </Badge>

                            {targetDivs.length > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <Building2 className="w-3 h-3" />
                                {targetDivs.join(", ")}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}