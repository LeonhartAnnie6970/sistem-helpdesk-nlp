"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SuperAdminTicketsPanel } from "@/components/super-admin-tickets-panel"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { useSuperAdminDashboard } from "../dashboard-context"

export default function SuperAdminTicketsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, refreshTrigger, bumpRefresh } = useSuperAdminDashboard()

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  useEffect(() => {
    const raw = searchParams.get("ticketId")
    const id = raw ? Number(raw) : null
    if (id && !Number.isNaN(id)) {
      setSelectedTicketId(id)
      setIsTicketModalOpen(true)
    }
  }, [searchParams])

  const handleOpenTicketDetail = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setIsTicketModalOpen(true)
  }

  const handleCloseTicketDetail = () => {
    setIsTicketModalOpen(false)
    setSelectedTicketId(null)
    router.replace("/super-admin/dashboard/tickets")
  }

  return (
    <>
      <SuperAdminTicketsPanel
        token={token}
        onTicketClick={handleOpenTicketDetail}
        refreshTrigger={refreshTrigger}
      />

      <TicketDetailModal
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketDetail}
        ticketId={selectedTicketId}
        onUpdate={bumpRefresh}
      />
    </>
  )
}
