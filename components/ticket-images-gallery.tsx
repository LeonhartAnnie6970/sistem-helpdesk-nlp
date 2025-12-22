"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketImageModal } from "@/components/ticket-image-modal"
import Image from "next/image"

interface TicketWithImage {
  id: string
  title: string
  status: string
  category: string
  created_at: string
  image_user_url: string
  name: string
}

export function TicketImagesGallery() {
  const [ticketsWithImages, setTicketsWithImages] = useState<TicketWithImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    title: string
    userName: string
  } | null>(null)

  useEffect(() => {
    fetchTicketsWithImages()
  }, [])

  const fetchTicketsWithImages = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch("/api/admin/tickets-images", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setError("Failed to fetch ticket images")
        return
      }

      const data = await response.json()
      console.log("[v0] Fetched images data:", data)
      const filteredTickets = (data.ticketsWithImages || []).filter(
        (ticket: TicketWithImage) => ticket.image_user_url && ticket.image_user_url.trim() !== "",
      )
      console.log("[v0] Filtered tickets with images:", filteredTickets)
      setTicketsWithImages(filteredTickets)
    } catch (err) {
      console.error("[v0] Error fetching images:", err)
      setError("An error occurred while fetching images")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  if (ticketsWithImages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Tidak ada gambar bukti laporan dari user</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeri Bukti Laporan User</CardTitle>
        <CardDescription>Gambar-gambar bukti laporan yang diunggah oleh user saat membuat ticket</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ticketsWithImages.map((ticket) => (
            <div
              key={ticket.id}
              className="group relative overflow-hidden rounded-lg border cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() =>
                setSelectedImage({
                  url: ticket.image_user_url,
                  title: ticket.title,
                  userName: ticket.name,
                })
              }
            >
              <div className="relative w-full aspect-square bg-muted">
                <Image
                  src={ticket.image_user_url || "/placeholder.svg"}
                  alt={ticket.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <div className="text-white text-xs">
                  <p className="font-semibold truncate">{ticket.title}</p>
                  <p className="text-gray-300 text-xs">{ticket.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {selectedImage && <TicketImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
    </Card>
  )
}
