"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TicketImageModal } from "./ticket-image-modal"
import { formatTicketId } from "@/lib/utils"
import { Hash, User, Building2, ImageIcon } from "lucide-react"

interface TicketWithImage {
  id: number
  title: string
  image_user_url: string | null
  name: string
  description: string
  status: string
  category: string
  created_at: string
  user_division: string
  user_division_name: string
}

export function TicketImagesGallery() {
  const [tickets, setTickets] = useState<TicketWithImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{
    url: string | null
    title: string
    userName?: string
    description: string
    ticketId?: number
    category?: string
    userDivision?: string
  } | null>(null)

  useEffect(() => {
    fetchTicketsWithImages()
  }, [])

  const fetchTicketsWithImages = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/tickets-images", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        setError(`Failed to fetch images: ${res.status} ${txt}`)
        setTickets([])
        setIsLoading(false)
        return
      }

      const data = await res.json()
      setTickets(Array.isArray(data.tickets) ? data.tickets : [])
    } catch (err) {
      console.error("fetchTicketsWithImages error", err)
      setError("Error fetching ticket images")
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase().trim()
    switch (s) {
      case "new": return "bg-blue-500 text-white"
      case "in_progress": return "bg-yellow-500 text-white"
      case "resolved": return "bg-green-500 text-white"
      case "closed":
      case "ditutup": return "bg-gray-600 text-white"
      default: return "bg-blue-500 text-white"
    }
  }

  const getStatusLabel = (status: string) => {
    const s = (status || "").toLowerCase().trim()
    switch (s) {
      case "new": return "Baru"
      case "in_progress": return "Diproses"
      case "resolved": return "Selesai"
      case "closed":
      case "ditutup": return "Ditutup"
      default: return status || "Baru"
    }
  }

  return (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-white dark:bg-black">
        <CardTitle className="text-black dark:text-white">Galeri Bukti Laporan User</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Gambar lampiran dari tiket yang masuk ke divisi Anda ({tickets.length} tiket dengan gambar)
        </CardDescription>
      </CardHeader>

      <CardContent className="bg-white dark:bg-black">
        {isLoading && <div className="text-gray-600 dark:text-gray-300">Loading...</div>}
        {error && <div className="text-red-600 dark:text-red-400">{error}</div>}

        {!isLoading && !error && tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Belum ada gambar bukti laporan</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gambar dari tiket yang masuk akan muncul di sini
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) =>
            ticket.image_user_url ? (
              <div
                key={ticket.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
              >
                {/* Image Section */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage({
                      url: ticket.image_user_url,
                      title: ticket.title,
                      userName: ticket.name,
                      description: ticket.description,
                      ticketId: ticket.id,
                      category: ticket.category,
                      userDivision: ticket.user_division || ticket.user_division_name,
                    })
                  }
                  className="relative w-full aspect-video overflow-hidden block hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={ticket.image_user_url}
                    alt={ticket.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>

                {/* Ticket Info Section */}
                <div className="p-3 space-y-2">
                  {/* Ticket ID & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">
                        {formatTicketId(ticket.id, ticket.user_division || ticket.user_division_name)}
                      </span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>

                  {/* Title */}
                  <p className="font-medium text-sm text-black dark:text-white line-clamp-1">
                    {ticket.title}
                  </p>

                  {/* User Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <User className="w-3 h-3" />
                    <span>{ticket.name}</span>
                  </div>

                  {/* Division & Category */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                      <Building2 className="w-3 h-3 mr-1" />
                      {ticket.user_division || ticket.user_division_name}
                    </Badge>
                    {ticket.category && (
                      <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                        {ticket.category}
                      </Badge>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ) : null
          )}
        </div>
      </CardContent>

      {selectedImage && (
        <TicketImageModal
          image={{
            url: selectedImage.url,
            title: selectedImage.title,
            userName: selectedImage.userName,
            type: "user",
            description: selectedImage.description
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </Card>
  )
}
