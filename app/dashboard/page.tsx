"use client"

import { useRouter } from "next/navigation"
import { OutgoingTickets } from "@/components/outgoing-tickets"
import { IncomingTickets } from "@/components/incoming-tickets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useUserDashboard } from "./dashboard-context"

export default function UserDashboardOverviewPage() {
  const router = useRouter()
  const { refreshTrigger } = useUserDashboard()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <CardTitle className="text-black dark:text-white">Selamat Datang! 👋</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Gunakan sistem ini untuk melaporkan masalah atau pertanyaan Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-white dark:bg-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buat Tiket Baru - Biru */}
            <div
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push("/dashboard/my-tickets?new=1")}
            >
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-white text-lg">Buat Tiket Baru</p>
                <p className="text-sm text-white/80 mt-1">Laporkan masalah Anda</p>
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full" />
            </div>

            {/* Lihat Tiket Saya - Hijau */}
            <div
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push("/dashboard/my-tickets")}
            >
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-white text-lg">Lihat Tiket Saya</p>
                <p className="text-sm text-white/80 mt-1">Monitor status ticket</p>
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tickets Preview */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <CardTitle className="text-black dark:text-white">Tiket Keluar Terbaru</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Ticket yang baru saja Anda buat</CardDescription>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          <OutgoingTickets refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>

      {/* Incoming Tickets Preview */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black">
          <CardTitle className="text-black dark:text-white">Tiket Masuk Terbaru</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Ticket dari divisi lain untuk Anda</CardDescription>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          <IncomingTickets refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  )
}
