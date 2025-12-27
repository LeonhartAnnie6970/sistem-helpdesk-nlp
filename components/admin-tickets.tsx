"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Clock, XCircle, Image as ImageIcon } from "lucide-react"

interface Ticket {
  id: number
  judul: string
  deskripsi: string
  divisi: string
  status: string
  prioritas: string
  gambar_url?: string
  created_at: string
  user: {
    nama: string
    email: string
  }
}

interface AdminDivisionTicketsProps {
  userRole: string
  userDivision: string
}

export function AdminDivisionTickets({ userRole, userDivision }: AdminDivisionTicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [adminNote, setAdminNote] = useState("")
  const [updating, setUpdating] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/tickets", {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return

    setUpdating(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          catatan_admin: adminNote,
        }),
      })

      if (response.ok) {
        await fetchTickets()
        setSelectedTicket(null)
        setNewStatus("")
        setAdminNote("")
      }
    } catch (error) {
      console.error("Error updating ticket:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "selesai":
        return <CheckCircle2 className="w-4 h-4" />
      case "dalam proses":
        return <Clock className="w-4 h-4" />
      case "dibatalkan":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "selesai":
        return "bg-green-500"
      case "dalam proses":
        return "bg-blue-500"
      case "dibatalkan":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "tinggi":
        return "destructive"
      case "sedang":
        return "default"
      default:
        return "secondary"
    }
  }

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Memuat tiket...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tiket Divisi {userDivision}</CardTitle>
          <CardDescription>Total: {tickets.length} tiket</CardDescription>
        </CardHeader>
      </Card>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Belum ada tiket untuk divisi ini
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{ticket.judul}</h3>
                      <Badge variant={getPriorityColor(ticket.prioritas)}>
                        {ticket.prioritas}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dari: {ticket.user.nama} ({ticket.user.email})
                    </p>
                    <p className="text-sm mb-2">{ticket.deskripsi}</p>
                    <p className="text-xs text-muted-foreground">
                      Dibuat: {new Date(ticket.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(ticket.status)} variant="default">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </span>
                    </Badge>
                    <Badge variant="outline">{ticket.divisi}</Badge>
                  </div>
                </div>

                {ticket.gambar_url && (
                  <div className="mb-4">
                    <button
                      onClick={() => openImageModal(ticket.gambar_url!)}
                      className="relative group cursor-pointer"
                    >
                      <img
                        src={ticket.gambar_url}
                        alt="Lampiran tiket"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      setSelectedTicket(ticket)
                      setNewStatus(ticket.status)
                      setAdminNote("")
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Kelola
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Status Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kelola Tiket</DialogTitle>
              <DialogDescription>{selectedTicket.judul}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menunggu">Menunggu</SelectItem>
                    <SelectItem value="dalam proses">Dalam Proses</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Catatan Admin</label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Tambahkan catatan untuk user..."
                  rows={4}
                />
              </div>

              {selectedTicket.gambar_url && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Lampiran</label>
                  <img
                    src={selectedTicket.gambar_url}
                    alt="Lampiran tiket"
                    className="w-full max-h-64 object-contain rounded-lg border cursor-pointer"
                    onClick={() => openImageModal(selectedTicket.gambar_url!)}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleUpdateStatus} disabled={updating} className="flex-1">
                  {updating ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button
                  onClick={() => setSelectedTicket(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gambar Lampiran</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Lampiran tiket"
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}