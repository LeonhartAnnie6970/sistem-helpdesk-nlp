"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from "@/components/dashboard-sidebar"
import { TicketForm } from "@/components/ticket-form"
import { OutgoingTickets } from "@/components/outgoing-tickets"
import { IncomingTickets } from "@/components/incoming-tickets"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { UserNotificationsPanel } from "@/components/user-notifications-panel"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [token, setToken] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [activeTicketTab, setActiveTicketTab] = useState("outgoing")
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      router.replace("/login")
      return
    }

    setToken(storedToken)

    // Replace current history state to prevent back navigation to login
    // This ensures that pressing back button won't go to login page
    window.history.replaceState(null, '', window.location.href)

    // Check URL parameters untuk navigate ke tab tertentu
    const tab = searchParams.get('tab')
    const view = searchParams.get('view')

    if (tab === 'my-tickets') {
      setActiveTab('my-tickets')
      if (view === 'incoming') {
        setActiveTicketTab('incoming')
      }
    }

    // Check localStorage flag dari notifikasi
    const openIncoming = localStorage.getItem('openIncomingTickets')
    if (openIncoming === 'true') {
      setActiveTab('my-tickets')
      setActiveTicketTab('incoming')
      localStorage.removeItem('openIncomingTickets')
    }

    fetch("/api/user/profile", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.role === "admin") {
          router.replace("/admin/dashboard")
          return
        }

        // user biasa
        setIsAuthenticated(true)
        fetchNotificationCount(storedToken)

        // Poll for notifications every 30 seconds
        const interval = setInterval(() => {
          fetchNotificationCount(storedToken)
        }, 30000)

        return () => clearInterval(interval)
      })
      .catch(() => router.replace("/login"))
  }, [router, searchParams])


  const fetchNotificationCount = async (token: string) => {
    try {
      const response = await fetch("/api/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setNotificationCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    router.push("/login")
  }

  const handleTicketSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setShowNewTicketForm(false)
  }

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  // Handler untuk klik notifikasi - buka detail ticket langsung
  const handleNotificationTicketClick = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setIsTicketModalOpen(true)
    setActiveTab("my-tickets")
    setActiveTicketTab("outgoing") // Default ke outgoing, modal akan menampilkan detail
  }

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false)
    setSelectedTicketId(null)
  }

  const handleTicketUpdate = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Sidebar */}
      <Sidebar
        role="user"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={handleOpenNotifications}
        notificationCount={notificationCount}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 bg-white dark:bg-black",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Bar - Minimal Header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                {activeTab === "dashboard" ? "Dashboard" : "Tiket Saya"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {activeTab === "dashboard"
                  ? "Selamat datang di helpdesk system"
                  : "Kelola dan monitor ticket Anda"}
              </p>
            </div>

            {activeTab === "my-tickets" && (
              <Button onClick={() => setShowNewTicketForm(!showNewTicketForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Buat Tiket Baru
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 space-y-6 bg-white dark:bg-black">
          {activeTab === "dashboard" && (
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
                    <Button
                      className="h-24 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      variant="outline"
                      onClick={() => {
                        setActiveTab("my-tickets")
                        setShowNewTicketForm(true)
                      }}
                    >
                      <div className="text-center">
                        <Plus className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-medium">Buat Tiket Baru</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Laporkan masalah Anda</p>
                      </div>
                    </Button>
                    <Button
                      className="h-24 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      variant="outline"
                      onClick={() => setActiveTab("my-tickets")}
                    >
                      <div className="text-center">
                        <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium">Lihat Tiket Saya</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Monitor status ticket</p>
                      </div>
                    </Button>
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
          )}

          {activeTab === "my-tickets" && (
            <div className="space-y-6">
              {/* New Ticket Form */}
              {showNewTicketForm && (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-white dark:bg-black">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-black dark:text-white">Buat Tiket Baru</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">Laporkan masalah atau pertanyaan Anda</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewTicketForm(false)}
                      >
                        Tutup
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-black">
                    <TicketForm onSuccess={handleTicketSuccess} />
                  </CardContent>
                </Card>
              )}

              {/* Tickets List with Tabs */}
              <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-white dark:bg-black">
                  <CardTitle className="text-black dark:text-white">Tiket</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Kelola tiket Anda dan tiket divisi</CardDescription>
                </CardHeader>
                <CardContent className="bg-white dark:bg-black">
                  <Tabs value={activeTicketTab} onValueChange={setActiveTicketTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="outgoing">
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Tiket Keluar
                      </TabsTrigger>
                      <TabsTrigger value="incoming">
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
            </div>
          )}
        </div>
      </main>

      {/* Notification Panel - Positioned from sidebar */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowNotifications(false)}>
          <div
            className={cn(
              "fixed top-16 w-96 max-h-[calc(100vh-80px)] bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300",
              sidebarCollapsed ? "left-16" : "left-64"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <UserNotificationsPanel
              token={token}
              onTicketClick={handleNotificationTicketClick}
              onClose={() => setShowNotifications(false)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        token={token}
      />

      {/* Ticket Detail Modal - untuk membuka dari notifikasi */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={isTicketModalOpen}
          onClose={handleCloseTicketModal}
          onUpdate={handleTicketUpdate}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  )
}