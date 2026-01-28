"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Clock, XCircle, Users, Ticket as TicketIcon, TrendingUp, BarChart3 } from "lucide-react"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { DIVISIONS } from "@/lib/divisions"

interface Ticket {
  id: number
  title: string
  description: string
  user_division: string // Divisi dari tabel tickets
  user_division_name: string // Divisi dari join users (alias)
  target_divisions: string // JSON array of target divisions
  status: string
  category: string
  nlp_category: string
  image_user_url?: string
  admin_notes?: string
  created_at: string
  name: string
  email: string
}

interface DivisionStats {
  division: string
  totalTickets: number
  newTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
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
        console.log("[DivisionMonitoring] Fetched tickets:", data)
        console.log("[DivisionMonitoring] Sample ticket fields:", data[0] ? Object.keys(data[0]) : "No tickets")
        setTickets(data)
      } else {
        console.error("[DivisionMonitoring] Failed to fetch tickets:", response.status)
      }
    } catch (error) {
      console.error("[DivisionMonitoring] Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get division from ticket
  const getTicketDivision = (ticket: Ticket): string => {
    // Priority: user_division_name (from join) > user_division (from tickets table)
    return ticket.user_division_name || ticket.user_division || ""
  }

  const calculateDivisionStats = () => {
    // Initialize all divisions from DIVISIONS constant with zero values
    const divisionMap = new Map<string, DivisionStats>()

    // Pre-populate with all known divisions (so all divisions appear even with 0 tickets)
    DIVISIONS.forEach((div) => {
      divisionMap.set(div, {
        division: div,
        totalTickets: 0,
        newTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
      })
    })

    console.log("[DivisionMonitoring] Calculating stats for", tickets.length, "tickets")

    tickets.forEach((ticket) => {
      // Use user_division_name from join (u.division), fallback to user_division from tickets table
      const division = getTicketDivision(ticket)
      console.log("[DivisionMonitoring] Ticket", ticket.id, "division:", division, "user_division:", ticket.user_division, "user_division_name:", ticket.user_division_name, "status:", ticket.status)

      // Skip tickets with no division (Unknown)
      if (!division || division === "Unknown" || division === "") return

      // If division doesn't exist in map (custom division), add it
      if (!divisionMap.has(division)) {
        divisionMap.set(division, {
          division,
          totalTickets: 0,
          newTickets: 0,
          inProgressTickets: 0,
          resolvedTickets: 0,
          closedTickets: 0,
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
        case "resolved":
          stats.resolvedTickets++
          break
        case "closed":
          stats.closedTickets++
          break
      }
    })

    // Sort by total tickets descending, but keep divisions with 0 tickets at the end
    setDivisionStats(Array.from(divisionMap.values()).sort((a, b) => {
      // If both have tickets or both don't, sort by total
      if ((a.totalTickets > 0) === (b.totalTickets > 0)) {
        return b.totalTickets - a.totalTickets
      }
      // Divisions with tickets come first
      return b.totalTickets - a.totalTickets
    }))
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
      case "new":
        return <AlertCircle className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "resolved":
        return <CheckCircle2 className="w-4 h-4" />
      case "closed":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" /> // Default to New icon
    }
  }

  // Updated status colors based on requirements
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-500 hover:bg-blue-600" // Biru untuk New
      case "in_progress":
        return "bg-yellow-500 hover:bg-yellow-600" // Kuning untuk In Progress
      case "resolved":
        return "bg-green-500 hover:bg-green-600" // Hijau untuk Resolved
      case "closed":
        return "bg-gray-600 hover:bg-gray-700" // Abu-abu gelap untuk Closed
      default:
        return "bg-blue-500 hover:bg-blue-600" // Default to New (Biru)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "Baru"
      case "in_progress":
        return "Proses"
      case "resolved":
        return "Selesai"
      case "closed":
        return "Ditutup"
      default:
        return "Baru" // Default label jika status tidak dikenali
    }
  }

  // Helper to check if ticket has valid division
  const hasValidDivision = (t: Ticket) => {
    const div = getTicketDivision(t)
    return div && div !== "Unknown" && div !== ""
  }

  // Filter tickets and exclude Unknown division
  const filteredTickets = (selectedDivision === "all"
    ? tickets.filter(t => hasValidDivision(t))
    : tickets.filter(t => getTicketDivision(t) === selectedDivision))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10) // Limit to 10 latest tickets

  // Calculate overall stats for analytics
  const overallStats = {
    total: tickets.filter(t => hasValidDivision(t)).length,
    new: tickets.filter(t => t.status?.toLowerCase() === "new" && hasValidDivision(t)).length,
    inProgress: tickets.filter(t => t.status?.toLowerCase() === "in_progress" && hasValidDivision(t)).length,
    resolved: tickets.filter(t => t.status?.toLowerCase() === "resolved" && hasValidDivision(t)).length,
    closed: tickets.filter(t => t.status?.toLowerCase() === "closed" && hasValidDivision(t)).length,
  }

  // Data for Pie Chart (Status Distribution)
  const statusChartData = [
    { name: "Baru", value: overallStats.new, color: "#3b82f6" },
    { name: "Proses", value: overallStats.inProgress, color: "#eab308" },
    { name: "Selesai", value: overallStats.resolved, color: "#22c55e" },
    { name: "Ditutup", value: overallStats.closed, color: "#4b5563" },
  ].filter(item => item.value > 0)

  // Mapping singkatan nama divisi untuk chart
  const divisionShortNames: Record<string, string> = {
    "IT": "IT",
    "ACC/FINANCE": "ACC/FNC",
    "OPERASIONAL": "OPR",
    "SALES": "SLS",
    "CUSTOMER SERVICE": "CS",
    "HR": "HR",
    "DIREKSI/DIREKTUR": "DIR",
  }

  // Helper to get short name for division
  const getShortDivisionName = (division: string): string => {
    return divisionShortNames[division] || division
  }

  // Data for Bar Chart (Division Distribution)
  const divisionChartData = divisionStats.map(stat => ({
    name: getShortDivisionName(stat.division),
    fullName: stat.division,
    total: stat.totalTickets,
    baru: stat.newTickets,
    proses: stat.inProgressTickets,
    selesai: stat.resolvedTickets,
    ditutup: stat.closedTickets,
  }))

  if (loading) {
    return <div className="flex items-center justify-center p-8 text-black dark:text-white">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Analytics Section - Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2 bg-white dark:bg-black">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <TicketIcon className="w-4 h-4" />
              Total Tiket
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <div className="text-3xl font-bold text-black dark:text-white">{overallStats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500">
          <CardHeader className="pb-2 bg-white dark:bg-black">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Baru</CardTitle>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <div className="text-2xl font-bold text-black dark:text-white">{overallStats.new}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2 bg-white dark:bg-black">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Dalam Proses</CardTitle>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <div className="text-2xl font-bold text-black dark:text-white">{overallStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500">
          <CardHeader className="pb-2 bg-white dark:bg-black">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Selesai</CardTitle>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <div className="text-2xl font-bold text-black dark:text-white">{overallStats.resolved}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 border-l-4 border-l-gray-500">
          <CardHeader className="pb-2 bg-white dark:bg-black">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Ditutup</CardTitle>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <div className="text-2xl font-bold text-black dark:text-white">{overallStats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status Distribution */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-white dark:bg-black">
            <CardTitle className="text-black dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Distribusi Status Tiket
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Persentase tiket berdasarkan status
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-500">
                Tidak ada data tiket
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Division Distribution */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-white dark:bg-black">
            <CardTitle className="text-black dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tiket per Divisi
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Jumlah tiket berdasarkan divisi asal
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            {divisionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={divisionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(label, payload) => {
                      // Show full division name in tooltip
                      if (payload && payload.length > 0) {
                        return payload[0]?.payload?.fullName || label
                      }
                      return label
                    }}
                  />
                  <Legend />
                  <Bar dataKey="baru" name="Baru" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="proses" name="Proses" fill="#eab308" stackId="a" />
                  <Bar dataKey="selesai" name="Selesai" fill="#22c55e" stackId="a" />
                  <Bar dataKey="ditutup" name="Ditutup" fill="#4b5563" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-500">
                Tidak ada data divisi
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Division Statistics Cards */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <CardTitle className="text-black dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Statistik per Divisi
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Klik untuk filter tiket berdasarkan divisi
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {divisionStats.map((stat) => (
              <Card
                key={stat.division}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDivision === stat.division
                    ? "ring-2 ring-blue-500 border-blue-500"
                    : "border-gray-200 dark:border-gray-700"
                } bg-white dark:bg-black`}
                onClick={() => setSelectedDivision(stat.division === selectedDivision ? "all" : stat.division)}
              >
                <CardContent className="p-4 bg-white dark:bg-black">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 truncate">
                      {stat.division}
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white mb-2">
                      {stat.totalTickets}
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{stat.newTickets}</div>
                        <div className="text-gray-500">B</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">{stat.inProgressTickets}</div>
                        <div className="text-gray-500">P</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{stat.resolvedTickets}</div>
                        <div className="text-gray-500">S</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-600">{stat.closedTickets}</div>
                        <div className="text-gray-500">T</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ticket List - Limited to 10 Latest */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-black dark:text-white">10 Tiket Terbaru</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {selectedDivision === "all"
                  ? `Menampilkan ${filteredTickets.length} tiket terbaru dari semua divisi`
                  : `Menampilkan ${filteredTickets.length} tiket terbaru dari divisi ${selectedDivision}`}
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
                    {stat.division} ({stat.totalTickets})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black pt-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Tidak ada tiket untuk ditampilkan
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
                          Dari: {ticket.name} ({getTicketDivision(ticket)}) • {new Date(ticket.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            {getStatusLabel(ticket.status)}
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
