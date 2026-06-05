"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Table2, Loader2 } from "lucide-react"

// Separate component for PDF Export Button
function PdfExportButton({
  selectedStatus,
  disabled
}: {
  selectedStatus: string
  disabled: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = useCallback(async () => {
    if (isLoading || disabled) return

    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/admin/reports/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!response.ok) {
        alert("Gagal membuat laporan PDF")
        return
      }

      const data = await response.json()
      const tickets = data.tickets
      const division = data.division

      const { default: jsPDF } = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      const doc = new jsPDF({ orientation: "landscape" })

      const statusLabels: Record<string, string> = {
        new: "Baru",
        in_progress: "Diproses",
        resolved: "Selesai",
        closed: "Ditutup",
      }

      // Header
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Laporan Tiket Helpdesk", doc.internal.pageSize.width / 2, 18, { align: "center" })

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(`Divisi: ${division}`, doc.internal.pageSize.width / 2, 26, { align: "center" })
      doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, doc.internal.pageSize.width / 2, 32, { align: "center" })
      doc.text(`Total Tiket: ${tickets.length}`, doc.internal.pageSize.width / 2, 38, { align: "center" })

      // Table
      autoTable(doc, {
        startY: 45,
        head: [["ID", "Judul", "User", "Email", "Divisi", "Kategori", "Status", "Tanggal"]],
        body: tickets.map((t: any) => [
          t.id,
          t.title,
          t.name,
          t.email,
          t.divisi,
          t.category || "-",
          statusLabels[t.status] || t.status,
          new Date(t.created_at).toLocaleDateString("id-ID"),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      })

      const filename = `laporan-tiket-${division}-${Date.now()}.pdf`
      doc.save(filename)
    } catch (error) {
      console.error("Export error:", error)
      alert("Terjadi kesalahan saat export PDF")
    } finally {
      setIsLoading(false)
    }
  }, [selectedStatus, isLoading, disabled])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '10px 16px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: isLoading || disabled ? '#6b7280' : '#1f2937',
        color: '#ffffff',
        cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        fontSize: '14px',
        opacity: isLoading || disabled ? 0.7 : 1,
        position: 'relative',
        isolation: 'isolate',
        pointerEvents: 'auto',
      }}
    >
      {isLoading ? (
        <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
      ) : (
        <FileText style={{ width: '16px', height: '16px' }} />
      )}
      <span>{isLoading ? "Generating..." : "Export PDF"}</span>
    </button>
  )
}

// Separate component for Excel Export Button
function ExcelExportButton({
  selectedStatus,
  disabled
}: {
  selectedStatus: string
  disabled: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = useCallback(async () => {
    if (isLoading || disabled) return

    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/admin/reports/excel`, {
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

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `laporan-tiket-${selectedStatus}-${new Date().getTime()}.xlsx`
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
  }, [selectedStatus, isLoading, disabled])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '10px 16px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: isLoading || disabled ? '#6b7280' : '#16a34a',
        color: '#ffffff',
        cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        fontSize: '14px',
        opacity: isLoading || disabled ? 0.7 : 1,
        position: 'relative',
        isolation: 'isolate',
        pointerEvents: 'auto',
      }}
    >
      {isLoading ? (
        <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
      ) : (
        <Table2 style={{ width: '16px', height: '16px' }} />
      )}
      <span>{isLoading ? "Generating..." : "Export Excel"}</span>
    </button>
  )
}

export function AdminReport() {
  const [selectedStatus, setSelectedStatus] = useState("all")

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
      <CardContent>
        {/* Filter Status Section */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            Filter Status
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: selectedStatus === option.value ? '#3b82f6' : '#d1d5db',
                  backgroundColor: selectedStatus === option.value ? '#3b82f6' : 'transparent',
                  color: selectedStatus === option.value ? '#ffffff' : 'inherit',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  position: 'relative',
                  isolation: 'isolate',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Buttons Section - Using table layout for strict separation */}
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px', marginTop: '16px' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', padding: 0 }}>
                <PdfExportButton selectedStatus={selectedStatus} disabled={false} />
              </td>
              <td style={{ width: '50%', padding: 0 }}>
                <ExcelExportButton selectedStatus={selectedStatus} disabled={false} />
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
