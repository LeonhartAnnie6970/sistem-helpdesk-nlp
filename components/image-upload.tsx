"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface ImageUploadProps {
  label: string
  description?: string
  uploadType: "user_report" | "admin_resolution"
  onImageUpload: (url: string, filename: string) => void
  onImageRemove?: () => void
  previewUrl?: string
  isLoading?: boolean
}

export function ImageUpload({
  label,
  description,
  uploadType,
  onImageUpload,
  onImageRemove,
  previewUrl,
  isLoading = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (file: File) => {
    setUploadError("")

    // Validasi file
    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5MB")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", uploadType)

      const token = localStorage.getItem("token")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setUploadError(data.error || "Upload gagal")
        return
      }

      onImageUpload(data.url, data.filename)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError("Terjadi kesalahan saat upload")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {previewUrl ? (
        <Card className="p-4 relative">
          <div className="relative inline-block w-full">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded"
            />
            {!isLoading && (
              <button
                onClick={onImageRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={isUploading || isLoading}
            className="hidden"
            id={`file-input-${uploadType}`}
          />

          <label htmlFor={`file-input-${uploadType}`} className="cursor-pointer flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">
              {isUploading ? "Mengupload..." : "Klik atau drag gambar di sini"}
            </span>
            <span className="text-xs text-muted-foreground">PNG, JPG, atau GIF (maksimal 5MB)</span>
          </label>
        </div>
      )}

      {uploadError && <div className="p-2 bg-destructive/10 text-destructive text-xs rounded">{uploadError}</div>}
    </div>
  )
}
