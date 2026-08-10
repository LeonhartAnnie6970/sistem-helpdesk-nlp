"use client"

import { useState } from "react"
import { TicketForm } from "@/components/ticket-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { useSuperAdminDashboard } from "../dashboard-context"

export default function SuperAdminCreateTicketPage() {
  const { bumpRefresh } = useSuperAdminDashboard()
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)

  const handleTicketSuccess = () => {
    bumpRefresh()
    setShowNewTicketForm(false)
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
            Buat Tiket
          </Button>
        )}
      </div>

      {showNewTicketForm ? (
        <TicketForm onSuccess={handleTicketSuccess} />
      ) : (
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-white dark:bg-black">
            <CardTitle className="text-black dark:text-white">Buat Tiket Baru</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Klik tombol di bawah untuk membuat tiket baru
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-black flex items-center justify-center py-12">
            <Button onClick={() => setShowNewTicketForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Buat Tiket Baru
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
