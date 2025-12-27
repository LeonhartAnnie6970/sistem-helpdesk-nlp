"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TicketImagesGallery } from "@/components/ticket-images-gallery"
import { AdminReport } from "@/components/admin-report"
import { Badge } from "@/components/ui/badge"

interface Stats {
  totalTickets: number
  totalUsers: number
  byStatus: Array<{ status: string; count: number }>
  byCategory: Array<{ category: string; count: number }>
  recentTickets: Array<{id: number
    title: string
    status: string
    category: string
    name: string
    divisi: string | null
    created_at: string
  }>
}


export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setError("Failed to fetch stats")
        return
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError("An error occurred while fetching stats")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-300">No data available</div>
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2 bg-white dark:bg-black">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Tiket</CardTitle>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <div className="text-3xl font-bold text-black dark:text-white">{stats.totalTickets}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2 bg-white dark:bg-black">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total User</CardTitle>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <div className="text-3xl font-bold text-black dark:text-white">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Export Report Section */}
      <AdminReport />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-white dark:bg-black">
            <CardTitle className="text-black dark:text-white">Tiket per Status</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Distribusi status tiket</CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.byStatus.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Chart */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-white dark:bg-black">
            <CardTitle className="text-black dark:text-white">Tiket per Kategori</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Distribusi kategori tiket</CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <CardTitle className="text-black dark:text-white">Tiket Terbaru</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">10 tiket terbaru yang masuk</CardDescription>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          <div className="space-y-4">
            {stats.recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-black">
                <div>
                  <p className="font-medium text-black dark:text-white">{ticket.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{ticket.name}
                    {ticket.divisi && (
                      <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-black dark:text-white"> Divisi : {ticket.divisi} </Badge>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {ticket.category && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{ticket.category}</span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      ticket.status === "new"
                        ? "bg-blue-100 text-blue-800"
                        : ticket.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Images Gallery */}
      <TicketImagesGallery />
    </div>
  )
}
