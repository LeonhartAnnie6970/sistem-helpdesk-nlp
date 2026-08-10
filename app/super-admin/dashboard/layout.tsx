"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/dashboard-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/useSession"
import { SuperAdminDashboardContext } from "./dashboard-context"

const HEADER_COPY: Record<string, { title: string; description: string }> = {
  "/super-admin/dashboard/monitoring": {
    title: "Division Monitoring",
    description: "Monitor performa semua divisi",
  },
  "/super-admin/dashboard/tickets": {
    title: "All Tickets",
    description: "Kelola semua ticket dari seluruh sistem",
  },
  "/super-admin/dashboard/users": {
    title: "User Management",
    description: "Kelola akun pengguna dan admin",
  },
  "/super-admin/dashboard/create-ticket": {
    title: "Buat Tiket Baru",
    description: "Buat tiket atas nama super admin",
  },
}

function SuperAdminDashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { getSessionData, logout, checkSession, updateActivity } = useSession()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [token, setToken] = useState("")
  const [notificationCount, setNotificationCount] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const session = getSessionData()

    if (!session.isAuthenticated) {
      if (session.isExpired) {
        logout("Sesi Anda telah berakhir. Silakan login kembali.")
      } else {
        router.replace("/login")
      }
      return
    }

    if (session.role !== "super_admin") {
      if (session.role === "admin") {
        router.replace("/admin/dashboard")
      } else {
        router.replace("/dashboard")
      }
      return
    }

    const storedToken = session.token!
    setToken(storedToken)
    setIsAuthenticated(true)
    updateActivity()

    window.history.replaceState(null, '', window.location.href)

    fetchNotificationCount(storedToken)

    const interval = setInterval(() => {
      if (checkSession()) {
        fetchNotificationCount(storedToken)
      }
    }, 30000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, getSessionData, logout, checkSession, updateActivity])

  const fetchNotificationCount = async (authToken: string) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await response.json()
      setNotificationCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleTicketClick = (ticketId?: number | string | null) => {
    if (!ticketId) return
    const id = Number(ticketId)
    if (Number.isNaN(id)) return

    setShowNotifications(false)
    router.push(`/super-admin/dashboard/tickets?ticketId=${id}`)
  }

  const bumpRefresh = () => setRefreshTrigger((prev) => prev + 1)

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  const headerCopy = HEADER_COPY[pathname] || HEADER_COPY["/super-admin/dashboard/monitoring"]

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Sidebar */}
      <Sidebar
        role="super_admin"
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setShowNotifications(!showNotifications)}
        notificationCount={notificationCount}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 bg-white dark:bg-black",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                {headerCopy.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {headerCopy.description}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 space-y-6 bg-white dark:bg-black">
          <SuperAdminDashboardContext.Provider value={{ token, refreshTrigger, bumpRefresh }}>
            {children}
          </SuperAdminDashboardContext.Provider>
        </div>
      </main>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowNotifications(false)}>
          <div
            className={cn(
              "fixed top-16 w-96 max-h-[calc(100vh-80px)] bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-300",
              sidebarCollapsed ? "left-16" : "left-64"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <AdminNotificationsPanel
              token={token}
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={(count) => setNotificationCount(count)}
              onTicketClick={handleTicketClick}
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

export default function SuperAdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <SuperAdminDashboardShell>{children}</SuperAdminDashboardShell>
      </Suspense>
    </ThemeProvider>
  )
}
