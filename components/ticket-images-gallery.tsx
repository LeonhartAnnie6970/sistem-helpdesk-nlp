"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketImageModal } from "./ticket-image-modal"

interface TicketWithImage {
  id: number
  title: string
  image_user_url: string | null
  name: string
  description: string 
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeri Bukti Laporan User</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tickets.map((ticket) =>
            ticket.image_user_url ? (
              <button
                key={ticket.id}
                type="button"
                onClick={() =>
                  setSelectedImage({
                    url: ticket.image_user_url,
                    title: ticket.title,
                    userName: ticket.name,
                    description: ticket.description,
                  })
                }
                className="relative aspect-square rounded-lg overflow-hidden block"
              >
                <Image src={ticket.image_user_url} alt={ticket.title} fill className="object-cover" unoptimized />
              </button>
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