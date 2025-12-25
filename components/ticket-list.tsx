"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Clock, XCircle, ZoomIn } from "lucide-react"

interface Ticket {
  id: number
  title: string
  description: string
  divisi: string
  status: string
  category: string
  image_user_url?: string
  catatan_admin?: string
  created_at: string
  updated_at: string
}

interface TicketListProps {
  refreshTrigger: number
}

export function TicketList({ refreshTrigger }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")

  useEffect(() => {
    fetchTickets()
  }, [refreshTrigger])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      new: "Baru",
      in_progress: "Dalam Proses",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    }
    return statusMap[status?.toLowerCase()] || status
  }

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageModalOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Memuat tiket...</p>
        </CardContent>
      </Card>
    )
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Belum ada tiket. Buat tiket pertama Anda!
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedTicket(ticket)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{ticket.title}</h3>
                    {ticket.category && (
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {ticket.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dibuat: {new Date(ticket.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(ticket.status)} variant="default">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(ticket.status)}
                      {getStatusLabel(ticket.status)}
                    </span>
                  </Badge>
                </div>
              </div>

              {ticket.image_user_url && (
                <div className="mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openImageModal(ticket.image_user_url!)
                    }}
                    className="relative group"
                  >
                    <img
                      src={ticket.image_user_url}
                      alt="Lampiran tiket"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </button>
                </div>
              )}

              {ticket.catatan_admin && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium mb-1 text-blue-900 dark:text-blue-100">
                    Catatan Admin:
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {ticket.catatan_admin}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTicket.title}
                {selectedTicket.category && (
                  <Badge variant="outline">{selectedTicket.category}</Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Deskripsi:</p>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  {selectedTicket.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Status:</p>
                <Badge className={getStatusColor(selectedTicket.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(selectedTicket.status)}
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </Badge>
              </div>

              {selectedTicket.image_user_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Lampiran Gambar:</p>
                  <img
                    src={selectedTicket.image_user_url}
                    alt="Lampiran tiket"
                    className="w-full max-h-96 object-contain rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(selectedTicket.image_user_url!)}
                  />
                </div>
              )}

              {selectedTicket.catatan_admin && (
                <div>
                  <p className="text-sm font-medium mb-1">Catatan Admin:</p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedTicket.catatan_admin}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <p>Dibuat: {new Date(selectedTicket.created_at).toLocaleString("id-ID")}</p>
                {selectedTicket.updated_at && (
                  <p>Diperbarui: {new Date(selectedTicket.updated_at).toLocaleString("id-ID")}</p>
                )}
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
    </>
  )
}