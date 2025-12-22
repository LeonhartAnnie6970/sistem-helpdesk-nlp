"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TicketImageModalProps {
  isOpen: boolean
  imageUrl: string | null
  imageTitle: string
  onClose: () => void
}

export function TicketImageModal({ isOpen, imageUrl, imageTitle, onClose }: TicketImageModalProps) {
  if (!imageUrl) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{imageTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <img src={imageUrl || "/placeholder.svg"} alt={imageTitle} className="max-h-96 object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
