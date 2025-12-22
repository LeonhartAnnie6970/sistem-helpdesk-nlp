"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketImageModal } from "@/components/ticket-image-modal"
import Image from "next/image"

interface TicketImage {
  id: string
  title: string
  status: string
  image_user_url: string | null
  image_admin_url: string | null
  name: string
  created_at: string
}

export function TicketImagesGalleryKelola() {
  const [ticketImages, setTicketImages] = useState<TicketImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    title: string
    type: "user" | "admin"
  } | null>(null)
  const [filterType, setFilterType] = useState<"all" | "user" | "admin">("all")

  useEffect(() => {
    fetchTicketImages()
  }, [])

  const fetchTicketImages = async () => {
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
      setTicketImages(data.allTicketsWithImages)
    } catch (err) {
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

  const filteredImages = ticketImages.filter((ticket) => {
    if (filterType === "user") return ticket.image_user_url
    if (filterType === "admin") return ticket.image_admin_url
    return ticket.image_user_url || ticket.image_admin_url
  })

  if (filteredImages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Tidak ada gambar untuk ditampilkan</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeri Gambar Tiket</CardTitle>
        <CardDescription>Semua gambar bukti laporan dan resolusi dari tiket</CardDescription>
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === "all" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType("user")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === "user" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Bukti Laporan
          </button>
          <button
            onClick={() => setFilterType("admin")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === "admin" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Bukti Resolved
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredImages.map((ticket) => (
            <div key={`${ticket.id}-wrapper`} className="space-y-2">
              {ticket.image_user_url && (
                <div
                  className="group relative overflow-hidden rounded-lg border cursor-pointer hover:shadow-lg transition-shadow bg-muted aspect-square"
                  onClick={() =>
                    setSelectedImage({
                      url: ticket.image_user_url!,
                      title: ticket.title,
                      type: "user",
                    })
                  }
                >
                  <Image
                    src={ticket.image_user_url || "/placeholder.svg"}
                    alt={`${ticket.title} - bukti laporan`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold">
                    Laporan
                  </div>
                  <div className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-2 py-1 rounded truncate max-w-[calc(100%-8px)]">
                    {ticket.name}
                  </div>
                </div>
              )}

              {ticket.image_admin_url && (
                <div
                  className="group relative overflow-hidden rounded-lg border cursor-pointer hover:shadow-lg transition-shadow bg-muted aspect-square"
                  onClick={() =>
                    setSelectedImage({
                      url: ticket.image_admin_url!,
                      title: ticket.title,
                      type: "admin",
                    })
                  }
                >
                  <Image
                    src={ticket.image_admin_url || "/placeholder.svg"}
                    alt={`${ticket.title} - bukti resolved`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
                    Resolved
                  </div>
                  <div
                    className={`absolute bottom-1 left-1 text-white text-xs px-2 py-1 rounded ${
                      ticket.status === "resolved" ? "bg-green-500/70" : "bg-yellow-500/70"
                    }`}
                  >
                    {ticket.status}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {selectedImage && (
        <TicketImageModal
          image={{
            url: selectedImage.url,
            title: selectedImage.title,
            userName: "",
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </Card>
  )
}
