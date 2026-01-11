// "use client"

// import { useEffect, useState } from "react"
// import { useRouter, useSearchParams } from 'next/navigation'
// import { Sidebar } from "@/components/dashboard-sidebar"
// import { AdminStats } from "@/components/admin-stats"
// import { AdminDivisionTickets } from "@/components/admin-division-tickets"
// import { ThemeProvider } from "@/components/theme-provider"
// import { UserProfileModal } from "@/components/user-profile-modal"
// import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"

// function AdminDashboardContent() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [isProfileOpen, setIsProfileOpen] = useState(false)
//   const [showNotifications, setShowNotifications] = useState(false)
//   const [token, setToken] = useState("")
//   const [activeTab, setActiveTab] = useState("analytics")
//   const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
//   const [notificationCount, setNotificationCount] = useState(0)
//   const [userRole, setUserRole] = useState("")
//   const [selecteduserDivision, setUserDivision] = useState("")

//   useEffect(() => {
//     const token = localStorage.getItem("token")
//     const role = localStorage.getItem("role")
//     const division = localStorage.getItem("division") || ""

//     if (!token || role !== "admin") {
//       router.push("/login")
//       return
//     }

//     setToken(token)
//     setUserRole(role)
//     setUserDivision(division)
//     setIsAuthenticated(true)

//     const ticketId = searchParams.get('ticketId')
//     if (ticketId) {
//       setActiveTab("tickets")
//       setSelectedTicketId(parseInt(ticketId))
//     }

//     // Fetch notification count
//     fetchNotificationCount(token)
//   }, [router, searchParams])

//   const fetchNotificationCount = async (token: string) => {
//     try {
//       const response = await fetch("/api/admin/notifications", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       const data = await response.json()
//       setNotificationCount(data.unreadCount || 0)
//     } catch (error) {
//       console.error("Error fetching notification count:", error)
//     }
//   }

//   const handleTicketClick = (ticketId?: number | string | null) => {
//     if (ticketId === undefined || ticketId === null || ticketId === "") {
//       console.warn("handleTicketClick called without a ticketId", ticketId)
//       return
//     }

//     const idNum = Number(ticketId)
//     if (Number.isNaN(idNum)) {
//       console.warn("handleTicketClick received invalid ticketId", ticketId)
//       return
//     }

//     setActiveTab("tickets")
//     setSelectedTicketId(idNum)
//     setShowNotifications(false)

//     const url = new URL(window.location.href)
//     url.searchParams.set('ticketId', String(idNum))
//     window.history.pushState({}, '', url)
//   }

//   const handleLogout = () => {
//     localStorage.removeItem("token")
//     localStorage.removeItem("userId")
//     localStorage.removeItem("role")
//     router.push("/login")
//   }

//   const handleOpenNotifications = () => {
//     setShowNotifications(!showNotifications)
//   }

//   if (!isAuthenticated) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>
//   }

//   return (
//     <div className="flex h-screen bg-background">
//       {/* Sidebar */}
//       <Sidebar
//         role="admin"
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         onLogout={handleLogout}
//         onOpenProfile={() => setIsProfileOpen(true)}
//         onOpenNotifications={handleOpenNotifications}
//         notificationCount={notificationCount}
//       />

//       {/* Main Content */}
//       <main className="flex-1 overflow-y-auto ml-64 transition-all duration-300">
//         {/* Top Bar - Minimal Header */}
//         <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
//           <div className="px-6 py-4">
//             <div>
//               <h1 className="text-2xl font-bold">
//                 {activeTab === "analytics" ? "Analytics Dashboard" : "Kelola Tiket"}
//               </h1>
//               <p className="text-sm text-muted-foreground mt-1">
//                 {activeTab === "analytics" 
//                   ? "Monitor performa dan statistik sistem" 
//                   : "Kelola dan proses ticket dari user"}
//               </p>
//             </div>
//           </div>
//         </header>

//         {/* Content Area */}
//         <div className="p-6 space-y-6">
//           {activeTab === "analytics" && <AdminStats />}
//           {activeTab === "tickets" && <AdminDivisionTickets selectedTicketId={selectedTicketId} selecteduserRole={"user"} selecteduserDivision={selecteduserDivision} /> }
//         </div>
//       </main>

//       {/* Notification Panel - Positioned from sidebar */}
//       {showNotifications && (
//         <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowNotifications(false)}>
//           <div 
//             className="fixed left-64 top-16 w-96 max-h-[calc(100vh-80px)] bg-background border rounded-lg shadow-lg"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <AdminNotificationsPanel 
//               token={token} 
//               onTicketClick={(ticketId) => {
//                 handleTicketClick(ticketId)
//                 setShowNotifications(false)
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <UserProfileModal
//         isOpen={isProfileOpen}
//         onClose={() => setIsProfileOpen(false)}
//         token={token}
//       />
//     </div>
//   )
// }

// export default function AdminDashboardPage() {
//   return (
//     <ThemeProvider>
//       <AdminDashboardContent />
//     </ThemeProvider>
//   )
// }


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
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  /**
   * AUTH & PROFILE CHECK
   */
  useEffect(() => {
  const storedToken = localStorage.getItem("token")
  if (!storedToken) {
    router.push("/login")
    return
  }

  setToken(storedToken)

  fetch("/api/user/profile", {
    headers: { Authorization: `Bearer ${storedToken}` },
  })
    .then(res => res.json())
    .then(data => {
      if (data.role === "admin") {
        router.push("/admin/dashboard")
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
    .catch(() => router.push("/login"))
}, [router])


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

    setActiveTab("tickets")
    setSelectedTicketId(id)
    setShowNotifications(false)

    const url = new URL(window.location.href)
    url.searchParams.set("ticketId", String(id))
    window.history.pushState({}, "", url)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
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
              <Button onClick={() => setShowNewTicketForm(!showNewTicketForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                {showNewTicketForm ? "Tutup Form" : "Buat Tiket"}
              </Button>
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
                <Tabs defaultValue="outgoing" className="w-full">
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
              {showNewTicketForm && (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-white dark:bg-black">
                    <CardTitle className="text-black dark:text-white">Buat Tiket Baru</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Buat tiket sebagai admin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-black">
                    <TicketForm onSuccess={handleTicketSuccess} />
                  </CardContent>
                </Card>
              )}

              {!showNewTicketForm && (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-white dark:bg-black">
                    <CardTitle className="text-black dark:text-white">Buat Tiket Baru</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Klik tombol di atas untuk membuat tiket baru
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
