"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "./image-upload"
import { TicketImageModal } from "./ticket-image-modal"
import { ChevronDown, ChevronUp, ImageIcon } from "lucide-react"

interface AdminTicketDetailProps {
  ticket: any
  onStatusUpdate: (ticketId: number, newStatus: string) => Promise<void>
  isUpdating?: boolean
}

export function AdminTicketDetail({ ticket, onStatusUpdate, isUpdating = false }: AdminTicketDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageAdminUrl, setImageAdminUrl] = useState<string | null>(ticket.image_admin_url || null)
  const [imageAdminPreview, setImageAdminPreview] = useState<string | null>(ticket.image_admin_url || null)
  const [selectedImageModal, setSelectedImageModal] = useState<{ isOpen: boolean; url: string | null; title: string }>({
    isOpen: false,
    url: null,
    title: "",
  })
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleAdminImageUpload = async (url: string, filename: string) => {
    setImageAdminUrl(url)
    setImageAdminPreview(url)
    setIsUploadingImage(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageAdminUrl: url }),
      })

      if (!response.ok) {
        console.error("Failed to upload admin image")
        setImageAdminUrl(null)
        setImageAdminPreview(null)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setImageAdminUrl(null)
      setImageAdminPreview(null)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveAdminImage = () => {
    setImageAdminUrl(null)
    setImageAdminPreview(null)
  }

  const openImageModal = (url: string, title: string) => {
    setSelectedImageModal({ isOpen: true, url, title })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card className="mb-4">
        <div className="border-b p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-start justify-between hover:opacity-75"
          >
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg">{ticket.title}</h3>
              <div className="flex gap-2 items-center mt-1">
                <p className="text-sm text-muted-foreground">{ticket.name}</p>
                {ticket.divisi && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{ticket.divisi}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{ticket.category || "Uncategorized"}</Badge>
              <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
        </div>

        {isExpanded && (
          <CardContent className="pt-4 space-y-4">
            {/* Deskripsi */}
            <div>
              <h4 className="font-medium text-sm mb-2">Deskripsi</h4>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </div>

            {/* Bukti Laporan dari User */}
            {ticket.image_user_url && (
              <div>
                <h4 className="font-medium text-sm mb-2">Bukti Laporan (User)</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openImageModal(ticket.image_user_url, "Bukti Laporan User")}
                    className="gap-2"
                  >
                    <ImageIcon size={16} />
                    Lihat Gambar
                  </Button>
                </div>
              </div>
            )}

            {/* Status Update */}
            <div>
              <h4 className="font-medium text-sm mb-2">Update Status</h4>
              <Select value={ticket.status} onValueChange={(value) => onStatusUpdate(ticket.id, value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              {isUpdating && <span className="text-xs text-muted-foreground ml-2">Updating...</span>}
            </div>

            {/* Bukti Resolved - Admin Upload */}
            <div>
              <h4 className="font-medium text-sm mb-2">Bukti Resolved (Admin)</h4>
              {imageAdminPreview ? (
                <div className="space-y-2">
                  <div className="border rounded p-3 bg-gray-50">
                    <img
                      src={imageAdminPreview || "/placeholder.svg"}
                      alt="Admin Resolution"
                      className="max-h-48 object-cover rounded cursor-pointer hover:opacity-75"
                      onClick={() => openImageModal(imageAdminUrl || "", "Bukti Resolved Admin")}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveAdminImage}
                    disabled={isUploadingImage || isUpdating}
                  >
                    Hapus Gambar
                  </Button>
                </div>
              ) : (
                <ImageUpload
                  label=""
                  description="Upload screenshot atau gambar sebagai bukti bahwa ticket sudah di-resolve"
                  uploadType="admin_resolution"
                  onImageUpload={handleAdminImageUpload}
                  previewUrl={imageAdminPreview || undefined}
                  isLoading={isUploadingImage || isUpdating}
                />
              )}
            </div>

            {/* Metadata */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>Dibuat: {new Date(ticket.created_at).toLocaleString("id-ID")}</p>
              {ticket.image_admin_uploaded_at && (
                <p>Bukti resolved upload: {new Date(ticket.image_admin_uploaded_at).toLocaleString("id-ID")}</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modal untuk display image */}
      <TicketImageModal
        isOpen={selectedImageModal.isOpen}
        imageUrl={selectedImageModal.url}
        imageTitle={selectedImageModal.title}
        onClose={() => setSelectedImageModal({ isOpen: false, url: null, title: "" })}
      />
    </>
  )
}
