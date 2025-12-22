"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "./image-upload"

interface TicketFormProps {
  onSuccess?: () => void
}

export function TicketForm({ onSuccess }: TicketFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [predictedCategory, setPredictedCategory] = useState<string | null>(null)
  const [classifyingText, setClassifyingText] = useState(false)
  const [imageUserUrl, setImageUserUrl] = useState<string | null>(null)
  const [imageUserPreview, setImageUserPreview] = useState<string | null>(null)

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value
    setDescription(newDescription)

    if (newDescription.length > 10 && title.length > 3) {
      setClassifyingText(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/nlp/classify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: `${title} ${newDescription}` }),
        })

        if (response.ok) {
          const data = await response.json()
          setPredictedCategory(data.category)
        }
      } catch (err) {
        console.error("Classification error:", err)
      } finally {
        setClassifyingText(false)
      }
    }
  }

  const handleImageUpload = (url: string, filename: string) => {
    setImageUserUrl(url)
    setImageUserPreview(url)
  }

  const handleRemoveImage = () => {
    setImageUserUrl(null)
    setImageUserPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")

      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      if (imageUserUrl) {
        formData.append("imageUserUrl", imageUserUrl)
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create ticket")
        return
      }

      setSuccess("Tiket berhasil dibuat!")
      setTitle("")
      setDescription("")
      setImageUserUrl(null)
      setImageUserPreview(null)
      setPredictedCategory(null)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Tiket Baru</CardTitle>
        <CardDescription>Laporkan masalah atau pertanyaan Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">{error}</div>}
          {success && <div className="p-3 bg-green-100 text-green-800 text-sm rounded">{success}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Judul</label>
            <Input
              placeholder="Ringkas masalah Anda"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Textarea
              placeholder="Jelaskan masalah secara detail..."
              value={description}
              onChange={handleDescriptionChange}
              required
              rows={5}
              disabled={isLoading}
            />
          </div>

          {predictedCategory && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-muted-foreground mb-2">Kategori yang diprediksi:</p>
              <Badge>{predictedCategory}</Badge>
              {classifyingText && <span className="text-xs text-muted-foreground ml-2">Menganalisis...</span>}
            </div>
          )}

          <ImageUpload
            label="Bukti Laporan"
            description="Tambahkan screenshot atau gambar sebagai bukti laporan Anda (opsional)"
            uploadType="user_report"
            onImageUpload={handleImageUpload}
            onImageRemove={handleRemoveImage}
            previewUrl={imageUserPreview}
            isLoading={isLoading}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Membuat..." : "Buat Tiket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
