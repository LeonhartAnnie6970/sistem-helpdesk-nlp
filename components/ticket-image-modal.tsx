"use client"

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { ImageOff } from "lucide-react"

interface TicketImagePayload {
  url: string | null
  title: string
  userName?: string
  type?: "user" | "admin"
  description: string
}

interface TicketImageModalProps {
  // accept either an "image" object or individual props (backwards compatible)
  image?: TicketImagePayload
  isOpen?: boolean
  imageUrl?: string | null
  imageTitle?: string
  userName?: string
  description?: string
  type?: "user" | "admin"
  onClose: () => void
}

export function TicketImageModal({
  image,
  description,
  isOpen,
  imageUrl,
  imageTitle,
  userName,
  type,
  onClose,
}: TicketImageModalProps) {
  // prefer image object if provided
  const url = image?.url ?? imageUrl ?? null
  const title = image?.title ?? imageTitle ?? ""
  const uploader = image?.userName ?? userName
  const imageType = image?.type ?? type
  const open = isOpen ?? Boolean(image)
  const descriptionText = description ?? image?.description ?? ""

  const [imageError, setImageError] = useState(false)
  useEffect(() => {
    setImageError(false)
  }, [url])

  if (!url) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">{descriptionText}</DialogDescription>
        </DialogHeader>

        <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
              <ImageOff className="w-10 h-10" />
              <p className="text-sm">Gambar tidak dapat dimuat</p>
            </div>
          ) : (
            <Image
              src={url}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {uploader && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Uploaded by: <span className="font-medium text-black dark:text-white">{uploader}</span>
          </p>
        )}

        {imageType && (
          <div className="mt-2">
            <span
              className={`text-xs px-2 py-1 rounded ${imageType === "admin" ? "bg-green-600" : "bg-blue-600"} text-white font-medium`}
            >
              {imageType === "admin" ? "Bukti Resolved" : "Bukti Laporan"}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
