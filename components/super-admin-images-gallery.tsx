"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TicketImageModal } from "./ticket-image-modal"
import { ImageGallerySkeleton } from "@/components/ui/skeleton"
import { formatTicketId } from "@/lib/utils"
import { Hash, User, Building2, ImageIcon, Target } from "lucide-react"
import { motion } from "framer-motion"

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
  target_divisions: string
}

interface SuperAdminImagesGalleryProps {
  onTicketClick?: (ticketId: number) => void
}

export function SuperAdminImagesGallery({ onTicketClick }: SuperAdminImagesGalleryProps) {
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
      const res = await fetch("/api/super-admin/tickets-images", {
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

  const parseTargetDivisions = (targetDivisions: string): string[] => {
    try {
      return JSON.parse(targetDivisions || '[]')
    } catch {
      return []
    }
  }

  return (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-white dark:bg-black">
        <CardTitle className="text-black dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Galeri Bukti Laporan
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Semua gambar lampiran dari tiket yang masuk ({tickets.length} tiket dengan gambar)
        </CardDescription>
      </CardHeader>

      <CardContent className="bg-white dark:bg-black">
        {isLoading && <ImageGallerySkeleton count={6} />}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map((ticket, index) =>
            ticket.image_user_url ? (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1"
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
                  className="relative w-full aspect-video overflow-hidden block"
                >
                  <Image
                    src={ticket.image_user_url}
                    alt={ticket.title}
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
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
                    <span className="truncate">{ticket.name}</span>
                  </div>

                  {/* Division Info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                      <Building2 className="w-3 h-3 mr-1" />
                      {ticket.user_division || ticket.user_division_name}
                    </Badge>
                    {parseTargetDivisions(ticket.target_divisions).length > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        <Target className="w-3 h-3 mr-1" />
                        {parseTargetDivisions(ticket.target_divisions).join(", ")}
                      </Badge>
                    )}
                  </div>

                  {/* Category */}
                  {ticket.category && (
                    <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                      {ticket.category}
                    </Badge>
                  )}

                  {/* Date & Detail Button */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                    {onTicketClick && (
                      <button
                        onClick={() => onTicketClick(ticket.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Detail
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
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
