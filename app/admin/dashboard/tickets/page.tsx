"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OutgoingTickets } from "@/components/outgoing-tickets"
import { IncomingTickets } from "@/components/incoming-tickets"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useAdminDashboard } from "../dashboard-context"

export default function AdminTicketsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshTrigger, bumpRefresh } = useAdminDashboard()

  const [ticketSubTab, setTicketSubTab] = useState("outgoing")
  const [deepLinkTicketId, setDeepLinkTicketId] = useState<number | null>(null)

  useEffect(() => {
    const raw = searchParams.get("ticketId")
    const id = raw ? Number(raw) : null
    if (id && !Number.isNaN(id)) {
      setDeepLinkTicketId(id)
      setTicketSubTab("incoming")
    }
  }, [searchParams])

  const handleCloseDeepLink = () => {
    setDeepLinkTicketId(null)
    router.replace("/admin/dashboard/tickets")
  }

  return (
    <>
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <CardTitle className="text-black dark:text-white">Kelola Tiket</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Tiket keluar dan tiket masuk untuk divisi Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          <Tabs value={ticketSubTab} onValueChange={setTicketSubTab} className="w-full">
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

      {/* Deep-link dari notifikasi: buka tiket sesuai ?ticketId= di URL */}
      {deepLinkTicketId && (
        <TicketDetailModal
          ticketId={deepLinkTicketId}
          isOpen={!!deepLinkTicketId}
          onClose={handleCloseDeepLink}
          onUpdate={bumpRefresh}
        />
      )}
    </>
  )
}
