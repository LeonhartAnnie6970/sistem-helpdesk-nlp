"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/dashboard-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { UserNotificationsPanel } from "@/components/user-notifications-panel"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/useSession"
import { UserDashboardContext } from "./dashboard-context"

const HEADER_COPY: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Selamat datang di helpdesk system",
  },
  "/dashboard/my-tickets": {
    title: "Tiket Saya",
    description: "Kelola dan monitor ticket Anda",
  },
}

function UserDashboardShell({ children }: { children: React.ReactNode }) {
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

    const storedToken = session.token!
    setToken(storedToken)

    window.history.replaceState(null, '', window.location.href)

    fetch("/api/user/profile", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.role === "admin") {
          router.replace("/admin/dashboard")
          return
        }

        if (data.role === "super_admin") {
          router.replace("/super-admin/dashboard")
          return
        }

        setIsAuthenticated(true)
        updateActivity()
        fetchNotificationCount(storedToken)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, getSessionData, logout, checkSession, updateActivity])

  const fetchNotificationCount = async (authToken: string) => {
    try {
      const response = await fetch("/api/user/notifications", {
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

  const handleNotificationTicketClick = (ticketId: number) => {
    setShowNotifications(false)
    router.push(`/dashboard/my-tickets?ticketId=${ticketId}`)
  }

  const bumpRefresh = () => setRefreshTrigger((prev) => prev + 1)

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const headerCopy = HEADER_COPY[pathname] || HEADER_COPY["/dashboard"]

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Sidebar */}
      <Sidebar
        role="user"
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
        {/* Top Bar - Minimal Header */}
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
          <UserDashboardContext.Provider value={{ token, refreshTrigger, bumpRefresh }}>
            {children}
          </UserDashboardContext.Provider>
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
              onNotificationRead={() => fetchNotificationCount(token)}
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

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <UserDashboardShell>{children}</UserDashboardShell>
      </Suspense>
    </ThemeProvider>
  )
}
