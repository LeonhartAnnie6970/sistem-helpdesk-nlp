"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TicketImagesGallery } from "@/components/ticket-images-gallery"
import { AdminReport } from "@/components/admin-report"
import { Badge } from "@/components/ui/badge"
import { DashboardStatsSkeleton, ChartSkeleton, TicketListSkeleton } from "@/components/ui/skeleton"
import { AnimatedCard, AnimatedList, AnimatedListItem, fadeInUp, staggerContainer } from "@/components/ui/motion"
import { motion } from "framer-motion"
import { Ticket, Users } from "lucide-react"

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
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <DashboardStatsSkeleton count={2} />

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Recent Tickets Skeleton */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-white dark:bg-black">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <TicketListSkeleton count={5} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-300">No data available</div>
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={fadeInUp}
      >
        {/* Total Tiket - Blue Gradient */}
        <AnimatedCard delay={0}>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stats.totalTickets}</div>
              <div className="text-sm font-medium text-blue-100">Total Tiket</div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
          </div>
        </AnimatedCard>

        {/* Total User - Green Gradient */}
        <AnimatedCard delay={0.1}>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stats.totalUsers}</div>
              <div className="text-sm font-medium text-emerald-100">Total User</div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Export Report Section */}
      <AnimatedCard delay={0.2}>
        <AdminReport />
      </AnimatedCard>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={fadeInUp}
      >
        {/* Status Chart */}
        <AnimatedCard delay={0.3}>
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
        </AnimatedCard>

        {/* Category Chart */}
        <AnimatedCard delay={0.4}>
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
        </AnimatedCard>
      </motion.div>

      {/* Recent Tickets */}
      <AnimatedCard delay={0.5}>
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-white dark:bg-black">
            <CardTitle className="text-black dark:text-white">Tiket Terbaru</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">10 tiket terbaru yang masuk</CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black">
            <AnimatedList className="space-y-4">
              {stats.recentTickets.map((ticket, index) => (
                <AnimatedListItem key={ticket.id}>
                  <motion.div
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-black transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
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
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">{ticket.category}</span>
                      )}
                      {(() => {
                        const status = (ticket.status || "").toLowerCase().trim()
                        const statusColor = status === "new" ? "bg-blue-500"
                          : status === "in_progress" ? "bg-yellow-500"
                          : status === "resolved" ? "bg-green-500"
                          : status === "closed" || status === "ditutup" ? "bg-gray-600"
                          : "bg-blue-500"
                        const statusLabel = status === "new" ? "Baru"
                          : status === "in_progress" ? "Diproses"
                          : status === "resolved" ? "Selesai"
                          : status === "closed" || status === "ditutup" ? "Ditutup"
                          : "Baru"
                        return (
                          <span className={`text-xs px-2 py-1 rounded text-white font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                        )
                      })()}
                    </div>
                  </motion.div>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Ticket Images Gallery */}
      <AnimatedCard delay={0.6}>
        <TicketImagesGallery />
      </AnimatedCard>
    </motion.div>
  )
}
