"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Clock, XCircle, Image as ImageIcon, ZoomIn } from "lucide-react"

interface Ticket {
  id: number
  title: string
  description: string
  divisi: string
  target_division: string
  status: string
  category: string
  image_user_url?: string
  image_admin_url?: string
  catatan_admin?: string
  created_at: string
  name: string
  email: string
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
      const response = await fetch("/api/tickets", {
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
      const response = await fetch(`/api/tickets/${selectedTicket.id}`, {
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
    switch (status?.toLowerCase()) {
      case "selesai":
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />
      case "dalam proses":
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "dibatalkan":
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "selesai":
      case "completed":
        return "bg-green-500"
      case "dalam proses":
      case "in_progress":
        return "bg-blue-500"
      case "dibatalkan":
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
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
          <CardDescription>
            Total: {tickets.length} tiket dari user divisi Anda
          </CardDescription>
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
                      <h3 className="text-lg font-semibold">{ticket.title}</h3>
                      {ticket.category && (
                        <Badge variant="outline">{ticket.category}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dari: {ticket.name} ({ticket.email}) - Divisi: {ticket.divisi}
                    </p>
                    <p className="text-sm mb-2">{ticket.description}</p>
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
                  </div>
                </div>

                {ticket.image_user_url && (
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">
                      Gambar dari user:
                    </p>
                    <button
                      onClick={() => openImageModal(ticket.image_user_url!)}
                      className="relative group cursor-pointer"
                    >
                      <img
                        src={ticket.image_user_url}
                        alt="Lampiran tiket"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </button>
                  </div>
                )}

                {ticket.catatan_admin && (
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium mb-1 text-blue-900 dark:text-blue-100">
                      Catatan Admin:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {ticket.catatan_admin}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      setSelectedTicket(ticket)
                      setNewStatus(ticket.status)
                      setAdminNote(ticket.catatan_admin || "")
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kelola Tiket</DialogTitle>
              <DialogDescription>{selectedTicket.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Deskripsi:</p>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">User:</p>
                  <p className="text-sm">{selectedTicket.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTicket.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Divisi User:</p>
                  <Badge variant="outline">{selectedTicket.divisi}</Badge>
                </div>
              </div>

              {selectedTicket.image_user_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Gambar dari User:</p>
                  <img
                    src={selectedTicket.image_user_url}
                    alt="Lampiran tiket"
                    className="w-full max-h-64 object-contain rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(selectedTicket.image_user_url!)}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Baru</SelectItem>
                    <SelectItem value="in_progress">Dalam Proses</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
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
          <div className="flex items-center justify-center bg-muted rounded-lg p-4">
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