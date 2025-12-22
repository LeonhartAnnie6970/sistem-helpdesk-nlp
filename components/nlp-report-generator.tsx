"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, TrendingUp, Target, AlertCircle } from "lucide-react"
import { DIVISIONS } from "@/lib/divisions-refactor"

export function NLPReportGenerator() {
  const [status, setStatus] = useState("all")
  const [division, setDivision] = useState("all")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const generateReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams()
      if (status !== "all") params.append("status", status)
      if (division !== "all") params.append("division", division)

      const response = await fetch(`/api/admin/reports/nlp-analysis?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    const headers = [
      "ID",
      "Title",
      "Description",
      "Category",
      "Status",
      "Target Division",
      "NLP Confidence",
      "Keywords",
      "Overridden",
      "Original Division",
      "User Name",
      "User Division",
      "Created At",
    ]

    const rows = reportData.tickets.map((ticket: any) => [
      ticket.id,
      ticket.title,
      ticket.description,
      ticket.category,
      ticket.status,
      ticket.target_division,
      ticket.nlp_confidence || "N/A",
      ticket.nlp_keywords || "N/A",
      ticket.is_nlp_overridden ? "Yes" : "No",
      ticket.original_nlp_division || "N/A",
      ticket.name,
      ticket.divisi,
      new Date(ticket.created_at).toLocaleString(),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nlp-analysis-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Laporan Analisis NLP
          </CardTitle>
          <CardDescription>Generate laporan dengan analisis klasifikasi NLP dan confidence level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="new">Tiket Baru</SelectItem>
                  <SelectItem value="in_progress">Tiket Proses</SelectItem>
                  <SelectItem value="resolved">Tiket Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter Divisi</label>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {DIVISIONS.map((div) => (
                    <SelectItem key={div.value} value={div.value}>
                      {div.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full">
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Tiket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.totalTickets}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  High Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{reportData.summary.highConfidence}</div>
                <p className="text-xs text-muted-foreground">≥ 70% confidence</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-yellow-600" />
                  Medium Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{reportData.summary.mediumConfidence}</div>
                <p className="text-xs text-muted-foreground">40-69% confidence</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Overridden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{reportData.summary.overriddenCount}</div>
                <p className="text-xs text-muted-foreground">Manual correction</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Statistik per Divisi</CardTitle>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reportData.divisionStats).map(([divisionName, stats]: [string, any]) => (
                  <Card key={divisionName}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{divisionName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">New</p>
                          <Badge variant="outline" className="bg-blue-50">
                            {stats.new}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">In Progress</p>
                          <Badge variant="outline" className="bg-yellow-50">
                            {stats.in_progress}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Resolved</p>
                          <Badge variant="outline" className="bg-green-50">
                            {stats.resolved}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Confidence</p>
                          <p className="text-lg font-semibold">
                            {stats.avgConfidence ? `${(stats.avgConfidence * 100).toFixed(1)}%` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
