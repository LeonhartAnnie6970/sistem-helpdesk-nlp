"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard-sidebar"
import { AdminStats } from "@/components/admin-stats"
import { OutgoingTickets } from "@/components/outgoing-tickets"
import { IncomingTickets } from "@/components/incoming-tickets"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"
import { TicketForm } from "@/components/ticket-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, X, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/useSession"

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getSessionData, logout, checkSession, updateActivity } = useSession()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const [token, setToken] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userDivision, setUserDivision] = useState("")

  const [activeTab, setActiveTab] = useState("analytics")
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [ticketSubTab, setTicketSubTab] = useState("outgoing") // untuk kontrol tab tiket masuk/keluar

  /**
   * AUTH & PROFILE CHECK
   */
  useEffect(() => {
    // Check session validity first
    const session = getSessionData()

    if (!session.isAuthenticated) {
      if (session.isExpired) {
        logout("Sesi Anda telah berakhir. Silakan login kembali.")
      } else {
        router.replace("/login")
      }
      return
    }

    const storedToken = session.token!
    setToken(storedToken)

    // Replace current history state to prevent back navigation to login
    window.history.replaceState(null, '', window.location.href)

    fetch("/api/user/profile", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(res => res.json())
      .then(data => {
        // Hanya admin yang boleh akses halaman ini
        if (data.role !== "admin") {
          // Redirect user biasa ke dashboard user atau super admin
          if (data.role === "super_admin") {
            router.replace("/super-admin/dashboard")
          } else {
            router.replace("/dashboard")
          }
          return
        }

        // Admin - izinkan akses
        setIsAuthenticated(true)
        setUserDivision(data.division || "")
        updateActivity() // Update activity timestamp
        fetchNotificationCount(storedToken)

        // Poll for notifications every 30 seconds and check session
        const interval = setInterval(() => {
          if (checkSession()) {
            fetchNotificationCount(storedToken)
          }
        }, 30000)

        return () => clearInterval(interval)
      })
      .catch(() => {
        logout()
      })
  }, [router, getSessionData, logout, checkSession, updateActivity])


  /**
   * NOTIFICATIONS
   */
  const fetchNotificationCount = async (token: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setNotificationCount(data.unreadCount || 0)
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }

  /**
   * HANDLERS
   */
  const handleTicketClick = (ticketId?: number | string | null) => {
    if (!ticketId) return

    const id = Number(ticketId)
    if (Number.isNaN(id)) return

    // Pindah ke tab tickets dan sub-tab incoming (tiket masuk)
    setActiveTab("tickets")
    setTicketSubTab("incoming")
    setSelectedTicketId(id)
    setShowNotifications(false)

    // Trigger refresh untuk membuka modal tiket
    setRefreshTrigger((prev) => prev + 1)

    const url = new URL(window.location.href)
    url.searchParams.set("ticketId", String(id))
    window.history.pushState({}, "", url)
  }

  const handleLogout = () => {
    logout()
  }

  const handleTicketSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setShowNewTicketForm(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* SIDEBAR */}
      <Sidebar
        role="admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setShowNotifications(!showNotifications)}
        notificationCount={notificationCount}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* MAIN CONTENT */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 bg-white dark:bg-black",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                {activeTab === "analytics" && `Dashboard Admin ${userDivision}`}
                {activeTab === "tickets" && "Kelola Tiket"}
                {activeTab === "create-ticket" && "Buat Tiket Baru"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {activeTab === "analytics" && "Monitoring & pengelolaan tiket divisi"}
                {activeTab === "tickets" && "Kelola dan proses ticket dari user"}
                {activeTab === "create-ticket" && "Buat tiket atas nama admin"}
              </p>
            </div>
            {activeTab === "create-ticket" && (
              showNewTicketForm ? (
                <Button onClick={() => setShowNewTicketForm(false)} className="bg-red-600 hover:bg-red-700 text-white">
                  <X className="w-4 h-4 mr-2" />
                  Tutup
                </Button>
              ) : (
                <Button onClick={() => setShowNewTicketForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Tiket
                </Button>
              )
            )}
          </div>
        </header>

        <div className="p-6 space-y-6 bg-white dark:bg-black">
          {activeTab === "analytics" && (
            <AdminStats />
          )}

          {activeTab === "tickets" && (
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-white dark:bg-black">
                <CardTitle className="text-black dark:text-white">Kelola Tiket</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Tiket keluar dan tiket masuk untuk divisi Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white dark:bg-black">
                <Tabs value={ticketSubTab} onValueChange={setTicketSubTab} className="w-full">
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
          )}

          {activeTab === "create-ticket" && (
            <div className="space-y-6">
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
          )}
        </div>
      </main>

      {/* NOTIFICATION PANEL */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowNotifications(false)}>
          <div
            className={cn(
              "fixed top-16 w-96 max-h-[calc(100vh-80px)] bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300",
              sidebarCollapsed ? "left-16" : "left-64"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <AdminNotificationsPanel
              token={token}
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={(count) => setNotificationCount(count)}
              onTicketClick={(ticketId) => {
                setShowNotifications(false)
                handleTicketClick(ticketId)
              }}
            />
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        token={token}
      />
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <AdminDashboardContent />
      </Suspense>
    </ThemeProvider>
  )
}