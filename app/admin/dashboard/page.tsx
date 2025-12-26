"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from "@/components/dashboard-sidebar"
import { AdminStats } from "@/components/admin-stats"
import { AdminDivisionTickets } from "@/components/admin-division-tickets"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [token, setToken] = useState("")
  const [activeTab, setActiveTab] = useState("analytics")
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [userRole, setUserRole] = useState("")
  const [userDivision, setUserDivision] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    const division = localStorage.getItem("division") || ""

    if (!token || role !== "admin") {
      router.push("/login")
      return
    }

    setToken(token)
    setUserRole(role)
    setUserDivision(division)
    setIsAuthenticated(true)

    const ticketId = searchParams.get('ticketId')
    if (ticketId) {
      setActiveTab("tickets")
      setSelectedTicketId(parseInt(ticketId))
    }

    // Fetch notification count
    fetchNotificationCount(token)
  }, [router, searchParams])

  const fetchNotificationCount = async (token: string) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setNotificationCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }

  const handleTicketClick = (ticketId?: number | string | null) => {
    if (ticketId === undefined || ticketId === null || ticketId === "") {
      console.warn("handleTicketClick called without a ticketId", ticketId)
      return
    }

    const idNum = Number(ticketId)
    if (Number.isNaN(idNum)) {
      console.warn("handleTicketClick received invalid ticketId", ticketId)
      return
    }

    setActiveTab("tickets")
    setSelectedTicketId(idNum)
    setShowNotifications(false)

    const url = new URL(window.location.href)
    url.searchParams.set('ticketId', String(idNum))
    window.history.pushState({}, '', url)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    router.push("/login")
  }

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        role="admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={handleOpenNotifications}
        notificationCount={notificationCount}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-64 transition-all duration-300">
        {/* Top Bar - Minimal Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">
                {activeTab === "analytics" ? "Analytics Dashboard" : "Kelola Tiket"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "analytics" 
                  ? "Monitor performa dan statistik sistem" 
                  : "Kelola dan proses ticket dari user"}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {activeTab === "analytics" && <AdminStats />}
          {activeTab === "tickets" && <AdminDivisionTickets selectedTicketId={selectedTicketId} userRole={userRole} userDivision={userDivision} /> }
        </div>
      </main>

      {/* Notification Panel - Positioned from sidebar */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowNotifications(false)}>
          <div 
            className="fixed left-64 top-16 w-96 max-h-[calc(100vh-80px)] bg-background border rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminNotificationsPanel 
              token={token} 
              onTicketClick={(ticketId) => {
                handleTicketClick(ticketId)
                setShowNotifications(false)
              }}
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
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ThemeProvider>
      <AdminDashboardContent />
    </ThemeProvider>
  )
}