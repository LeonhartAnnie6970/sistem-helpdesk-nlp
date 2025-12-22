"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface DivisionStats {
  division: string
  total_tickets: number
  new_tickets: number
  in_progress_tickets: number
  resolved_tickets: number
  avg_confidence: number
  overridden_count: number
}

interface NLPMetrics {
  overall_confidence: number
  high_confidence_count: number
  medium_confidence_count: number
  low_confidence_count: number
  total_overridden: number
}

interface RecentActivity {
  id: number
  title: string
  target_division: string
  status: string
  nlp_confidence: number
  is_nlp_overridden: boolean
  created_at: string
  user_name: string
  user_division: string
}

interface Stats {
  divisionStats: DivisionStats[]
  adminsByDivision: Array<{ division: string; admin_count: number }>
  nlpMetrics: NLPMetrics
  recentActivity: RecentActivity[]
}

export function DivisionMonitoringDashboard() {
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

      const response = await fetch("/api/super-admin/division-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setError("Failed to fetch division stats")
        return
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError("An error occurred while fetching division stats")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading division monitoring data...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  if (!stats) {
    return <div className="text-center py-8">No data available</div>
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.7) {
      return <Badge className="bg-green-500">High ({Math.round(confidence * 100)}%)</Badge>
    } else if (confidence >= 0.4) {
      return <Badge className="bg-yellow-500">Medium ({Math.round(confidence * 100)}%)</Badge>
    } else {
      return <Badge className="bg-red-500">Low ({Math.round(confidence * 100)}%)</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Total Divisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.divisionStats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              NLP Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round((stats.nlpMetrics.overall_confidence || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Rata-rata akurasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Override Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.nlpMetrics.total_overridden || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Manual corrections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              High Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.nlpMetrics.high_confidence_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Prediksi akurat</p>
          </CardContent>
        </Card>
      </div>

      {/* Division Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performa Tiket per Divisi</CardTitle>
          <CardDescription>Status tiket untuk setiap divisi</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.divisionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="division" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="new_tickets" fill="#3b82f6" name="New" />
              <Bar dataKey="in_progress_tickets" fill="#f59e0b" name="In Progress" />
              <Bar dataKey="resolved_tickets" fill="#10b981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* NLP Confidence Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>NLP Confidence per Divisi</CardTitle>
            <CardDescription>Rata-rata akurasi prediksi NLP</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.divisionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="division" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
                <Line type="monotone" dataKey="avg_confidence" stroke="#8b5cf6" strokeWidth={2} name="Avg Confidence" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Override Statistics per Divisi</CardTitle>
            <CardDescription>Jumlah koreksi manual NLP</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.divisionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="division" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="overridden_count" fill="#ef4444" name="Overridden" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Division Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Statistik Divisi</CardTitle>
          <CardDescription>Ringkasan lengkap per divisi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Divisi</th>
                  <th className="text-right py-2 px-4">Total Tiket</th>
                  <th className="text-right py-2 px-4">New</th>
                  <th className="text-right py-2 px-4">In Progress</th>
                  <th className="text-right py-2 px-4">Resolved</th>
                  <th className="text-right py-2 px-4">NLP Confidence</th>
                  <th className="text-right py-2 px-4">Override</th>
                </tr>
              </thead>
              <tbody>
                {stats.divisionStats.map((div) => (
                  <tr key={div.division} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{div.division}</Badge>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">{div.total_tickets}</td>
                    <td className="text-right py-3 px-4">{div.new_tickets}</td>
                    <td className="text-right py-3 px-4">{div.in_progress_tickets}</td>
                    <td className="text-right py-3 px-4">{div.resolved_tickets}</td>
                    <td className="text-right py-3 px-4">{getConfidenceBadge(div.avg_confidence)}</td>
                    <td className="text-right py-3 px-4">{div.overridden_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>20 tiket terbaru dari semua divisi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{activity.user_name}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.user_division}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activity.target_division}</Badge>
                  {getConfidenceBadge(activity.nlp_confidence)}
                  {activity.is_nlp_overridden && <Badge className="bg-red-500">Overridden</Badge>}
                  <Badge
                    className={
                      activity.status === "new"
                        ? "bg-blue-500"
                        : activity.status === "in_progress"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
