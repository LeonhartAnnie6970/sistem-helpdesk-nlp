"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

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
  
  if (!url) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>

        <div className="relative w-full aspect-video">
          <Image
            src={url}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        </div>

        {uploader && <p className="text-sm text-muted-foreground mt-2">Uploaded by: {uploader}</p>}

        {imageType && (
          <div className="mt-2">
            <span
              className={`text-xs px-2 py-1 rounded ${imageType === "admin" ? "bg-green-600" : "bg-blue-600"} text-white`}
            >
              {imageType === "admin" ? "Bukti Resolved" : "Bukti Laporan"}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
