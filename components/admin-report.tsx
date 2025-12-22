"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Table2 } from "lucide-react"

export function AdminReport() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/admin/reports/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!response.ok) {
        alert("Failed to generate report")
        return
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `laporan-tiket-${selectedStatus}-${new Date().getTime()}.${format === "pdf" ? "pdf" : "xlsx"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("An error occurred while exporting")
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: "all", label: "Semua Tiket" },
    { value: "new", label: "Tiket Baru" },
    { value: "in_progress", label: "Tiket Proses" },
    { value: "resolved", label: "Tiket Selesai" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Laporan Tiket</CardTitle>
        <CardDescription>Download laporan tiket dalam format PDF atau Excel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter Status</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded border transition ${
                  selectedStatus === option.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={() => handleExport("pdf")} disabled={isLoading} className="gap-2 flex-1" variant="default">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          <Button onClick={() => handleExport("excel")} disabled={isLoading} className="gap-2 flex-1" variant="default">
            <Table2 className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
