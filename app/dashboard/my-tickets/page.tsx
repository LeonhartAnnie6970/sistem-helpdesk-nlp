"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TicketForm } from "@/components/ticket-form"
import { OutgoingTickets } from "@/components/outgoing-tickets"
import { IncomingTickets } from "@/components/incoming-tickets"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, X, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useUserDashboard } from "../dashboard-context"

export default function UserMyTicketsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshTrigger, bumpRefresh } = useUserDashboard()

  const [activeTicketTab, setActiveTicketTab] = useState("outgoing")
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowNewTicketForm(true)
    }

    const raw = searchParams.get("ticketId")
    const id = raw ? Number(raw) : null
    if (id && !Number.isNaN(id)) {
      setSelectedTicketId(id)
      setIsTicketModalOpen(true)
    }
  }, [searchParams])

  const handleTicketSuccess = () => {
    bumpRefresh()
    setShowNewTicketForm(false)
  }

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false)
    setSelectedTicketId(null)
    router.replace("/dashboard/my-tickets")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {showNewTicketForm ? (
          <Button onClick={() => setShowNewTicketForm(false)} className="bg-red-600 hover:bg-red-700 text-white">
            <X className="w-4 h-4 mr-2" />
            Tutup
          </Button>
        ) : (
          <Button onClick={() => setShowNewTicketForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Buat Tiket Baru
          </Button>
        )}
      </div>

      {/* New Ticket Form */}
      {showNewTicketForm && (
        <TicketForm onSuccess={handleTicketSuccess} />
      )}

      {/* Tickets List with Tabs */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <CardTitle className="text-black dark:text-white">Tiket</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Kelola tiket Anda dan tiket divisi</CardDescription>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          <Tabs value={activeTicketTab} onValueChange={setActiveTicketTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-12 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <TabsTrigger
                value="outgoing"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 rounded-lg border-2 border-transparent data-[state=active]:border-blue-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Tiket Keluar
              </TabsTrigger>
              <TabsTrigger
                value="incoming"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 rounded-lg border-2 border-transparent data-[state=active]:border-green-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Tiket Masuk
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outgoing" className="mt-0">
              <OutgoingTickets refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="incoming" className="mt-0">
              <IncomingTickets refreshTrigger={refreshTrigger} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Ticket Detail Modal - untuk membuka dari notifikasi */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={isTicketModalOpen}
          onClose={handleCloseTicketModal}
          onUpdate={bumpRefresh}
        />
      )}
    </div>
  )
}
