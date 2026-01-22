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
  Search,
  Trash2,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  onTicketClick?: (ticketId: number) => void
  refreshTrigger?: number
}

export function SuperAdminTicketsPanel({ token, onTicketClick, refreshTrigger }: SuperAdminTicketsPanelProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDivision, setFilterDivision] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Export state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [refreshTrigger])

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
    const config: Record<string, { label: string; className: string; icon: any }> = {
      new: { label: "Baru", className: "bg-blue-500 hover:bg-blue-600 text-white", icon: AlertCircle },
      in_progress: { label: "Diproses", className: "bg-yellow-500 hover:bg-yellow-600 text-white", icon: Clock },
      resolved: { label: "Selesai", className: "bg-green-500 hover:bg-green-600 text-white", icon: CheckCircle2 },
      closed: { label: "Ditutup", className: "bg-gray-600 hover:bg-gray-700 text-white", icon: XCircle },
    }

    const cfg = config[status] || config.new
    const Icon = cfg.icon

    return (
      <Badge className={`gap-1 ${cfg.className}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    )
  }

  const uniqueDivisions = Array.from(new Set(tickets.map(t => t.user_division).filter(Boolean)))
  const uniqueCategories = Array.from(new Set(tickets.map(t => t.nlp_category).filter(Boolean)))

  // Handle delete ticket
  const handleDeleteClick = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation()
    setTicketToDelete(ticket)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tickets/${ticketToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        // Remove ticket from local state
        setTickets(prev => prev.filter(t => t.id !== ticketToDelete.id))
        setDeleteDialogOpen(false)
        setTicketToDelete(null)
      } else {
        const data = await response.json()
        alert(data.error || "Gagal menghapus tiket")
      }
    } catch (error) {
      console.error("Error deleting ticket:", error)
      alert("Terjadi kesalahan saat menghapus tiket")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle export
  const handleExport = async (format: "excel" | "pdf") => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      params.set("format", format)

      if (filterCategory !== "all") params.set("category", filterCategory)
      if (filterDivision !== "all") params.set("division", filterDivision)
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (startDate) params.set("startDate", startDate)
      if (endDate) params.set("endDate", endDate)

      const response = await fetch(`/api/tickets/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "Gagal mengekspor laporan")
        return
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = format === "excel"
        ? `laporan-tiket-${new Date().toISOString().split("T")[0]}.xlsx`
        : `laporan-tiket-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting:", error)
      alert("Terjadi kesalahan saat mengekspor laporan")
    } finally {
      setIsExporting(false)
    }
  }

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
          <div className="flex items-center justify-between">
            <CardTitle>Filter & Export</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("excel")}
                disabled={isExporting}
                className="gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isExporting ? "Mengekspor..." : "Export Excel"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                {isExporting ? "Mengekspor..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

            <div>
              <Input
                type="date"
                placeholder="Dari Tanggal"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Input
                type="date"
                placeholder="Sampai Tanggal"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Active filters indicator */}
          {(filterStatus !== "all" || filterDivision !== "all" || filterCategory !== "all" || startDate || endDate) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filter aktif:</span>
              {filterStatus !== "all" && (
                <Badge variant="secondary">Status: {filterStatus}</Badge>
              )}
              {filterDivision !== "all" && (
                <Badge variant="secondary">Divisi: {filterDivision}</Badge>
              )}
              {filterCategory !== "all" && (
                <Badge variant="secondary">Kategori: {filterCategory}</Badge>
              )}
              {startDate && (
                <Badge variant="secondary">Dari: {startDate}</Badge>
              )}
              {endDate && (
                <Badge variant="secondary">Sampai: {endDate}</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus("all")
                  setFilterDivision("all")
                  setFilterCategory("all")
                  setStartDate("")
                  setEndDate("")
                  setSearchQuery("")
                }}
                className="text-xs h-6"
              >
                Reset Filter
              </Button>
            </div>
          )}
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
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onTicketClick?.(ticket.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
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

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onTicketClick?.(ticket.id)
                            }}
                          >
                            Detail
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => handleDeleteClick(ticket, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tiket?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tiket ini?
              {ticketToDelete && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="font-semibold">{ticketToDelete.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Dibuat oleh: {ticketToDelete.name} ({ticketToDelete.user_division})
                  </p>
                </div>
              )}
              <p className="mt-3 text-destructive font-medium">
                Tindakan ini tidak dapat dibatalkan. Semua data tiket termasuk komentar dan notifikasi terkait akan dihapus secara permanen.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus Tiket"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}