"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketImageModal } from "./ticket-image-modal"

interface TicketImage {
  id: number
  title: string
  status: string
  image_user_url: string | null
  image_admin_url: string | null
  name: string
  description: string
}

export function TicketImagesGalleryKelola() {
  const [tickets, setTickets] = useState<TicketImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{
    url: string | null
    title: string
    userName?: string
    type?: "user" | "admin"
    description: string
  } | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
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
      // endpoint returns { tickets: [...] } as implemented earlier
      setTickets(Array.isArray(data.tickets) ? data.tickets : [])
    } catch (err) {
      console.error("fetchTickets error", err)
      setError("Error fetching ticket images")
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeri Ticket Images</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="space-y-2">
              {ticket.image_user_url && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage({
                      url: ticket.image_user_url,
                      title: `${ticket.title} — Bukti User`,
                      userName: ticket.name,
                      type: "user",
                      description: ticket.description
                    })
                  }
                  className="relative aspect-square rounded-lg overflow-hidden block"
                >
                  <Image
                    src={ticket.image_user_url}
                    alt={ticket.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-2 left-2 text-xs text-white bg-blue-600 px-2 py-1 rounded">Bukti User</div>
                </button>
              )}

              {ticket.image_admin_url && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage({
                      url: ticket.image_admin_url,
                      title: `${ticket.title} — Bukti Admin`,
                      userName: ticket.name,
                      type: "admin",
                      description: ticket.description
                    })
                  }
                  className="relative aspect-square rounded-lg overflow-hidden block"
                >
                  <Image
                    src={ticket.image_admin_url}
                    alt={ticket.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-2 left-2 text-xs text-white bg-green-600 px-2 py-1 rounded">Bukti Admin</div>
                </button>
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
            userName: selectedImage.userName,
            type: selectedImage.type,
            description: selectedImage.description
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </Card>
  )
}