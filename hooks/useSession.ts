"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000

// Session storage keys
const SESSION_KEYS = {
  TOKEN: "token",
  ROLE: "role",
  USER_ID: "userId",
  USER_NAME: "userName",
  DIVISION: "division",
  LAST_ACTIVITY: "lastActivity",
  SESSION_START: "sessionStart",
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register"]

// Dashboard routes by role
const DASHBOARD_ROUTES: Record<string, string> = {
  super_admin: "/super-admin/dashboard",
  admin: "/admin/dashboard",
  user: "/dashboard",
}

export interface SessionData {
  token: string | null
  role: string | null
  userId: string | null
  userName: string | null
  division: string | null
  isAuthenticated: boolean
  isExpired: boolean
}

export function useSession() {
  const router = useRouter()
  const pathname = usePathname()
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get session data
  const getSessionData = useCallback((): SessionData => {
    if (typeof window === "undefined") {
      return {
        token: null,
        role: null,
        userId: null,
        userName: null,
        division: null,
        isAuthenticated: false,
        isExpired: false,
      }
    }

    const token = localStorage.getItem(SESSION_KEYS.TOKEN)
    const role = localStorage.getItem(SESSION_KEYS.ROLE)
    const userId = localStorage.getItem(SESSION_KEYS.USER_ID)
    const userName = localStorage.getItem(SESSION_KEYS.USER_NAME)
    const division = localStorage.getItem(SESSION_KEYS.DIVISION)
    const lastActivity = localStorage.getItem(SESSION_KEYS.LAST_ACTIVITY)

    // Check if session is expired
    const isExpired = lastActivity
      ? Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT
      : false

    return {
      token,
      role,
      userId,
      userName,
      division,
      isAuthenticated: !!token && !isExpired,
      isExpired,
    }
  }, [])

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(SESSION_KEYS.TOKEN)
      if (token) {
        localStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, Date.now().toString())
      }
    }
  }, [])

  // Clear all session data
  const clearSession = useCallback(() => {
    if (typeof window !== "undefined") {
      Object.values(SESSION_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  }, [])

  // Logout function
  const logout = useCallback((reason?: string) => {
    clearSession()

    // Store logout reason for display on login page
    if (reason && typeof window !== "undefined") {
      sessionStorage.setItem("logoutReason", reason)
    }

    router.push("/login")
  }, [clearSession, router])

  // Check session validity
  const checkSession = useCallback(() => {
    const session = getSessionData()

    if (session.isExpired && session.token) {
      // Session has expired
      logout("Sesi Anda telah berakhir. Silakan login kembali.")
      return false
    }

    return session.isAuthenticated
  }, [getSessionData, logout])

  // Force logout when user navigates to public pages (security measure)
  // This ensures users must re-login when they navigate back to login/home
  const forceLogoutOnPublicPage = useCallback(() => {
    const session = getSessionData()

    if (session.token && PUBLIC_ROUTES.includes(pathname)) {
      // User has a session but is on public page (likely pressed back)
      // Clear session and require re-login
      clearSession()
      sessionStorage.setItem("logoutReason", "Anda harus login kembali untuk melanjutkan.")
      return true
    }

    return false
  }, [getSessionData, pathname, clearSession])

  // Redirect authenticated users away from public pages (old behavior - not used)
  const redirectIfAuthenticated = useCallback(() => {
    const session = getSessionData()

    if (session.isAuthenticated && PUBLIC_ROUTES.includes(pathname)) {
      const dashboardRoute = DASHBOARD_ROUTES[session.role || "user"] || "/dashboard"
      router.replace(dashboardRoute)
      return true
    }

    return false
  }, [getSessionData, pathname, router])

  // Redirect unauthenticated users to login
  const requireAuth = useCallback(() => {
    const session = getSessionData()

    if (!session.isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      if (session.isExpired) {
        logout("Sesi Anda telah berakhir. Silakan login kembali.")
      } else {
        router.replace("/login")
      }
      return false
    }

    return true
  }, [getSessionData, pathname, router, logout])

  // Setup activity listeners
  useEffect(() => {
    if (typeof window === "undefined") return

    const session = getSessionData()
    if (!session.isAuthenticated) return

    // Events that indicate user activity
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"]

    const handleActivity = () => {
      updateActivity()

      // Reset the timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }

      activityTimeoutRef.current = setTimeout(() => {
        logout("Sesi Anda telah berakhir karena tidak ada aktivitas.")
      }, SESSION_TIMEOUT)
    }

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial activity update
    handleActivity()

    // Periodic session check every minute
    checkIntervalRef.current = setInterval(() => {
      checkSession()
    }, 60000)

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })

      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [getSessionData, updateActivity, logout, checkSession])

  // Handle browser back/forward navigation
  useEffect(() => {
    if (typeof window === "undefined") return

    const handlePopState = () => {
      const session = getSessionData()

      // If on a public route but was authenticated, check if still valid
      if (PUBLIC_ROUTES.includes(pathname)) {
        if (session.isAuthenticated) {
          // User pressed back to login page while authenticated
          // Redirect them back to dashboard
          const dashboardRoute = DASHBOARD_ROUTES[session.role || "user"] || "/dashboard"
          router.replace(dashboardRoute)
        }
      } else {
        // On protected route, verify authentication
        if (!session.isAuthenticated) {
          router.replace("/login")
        }
      }
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [getSessionData, pathname, router])

  // Handle page visibility change (tab switching)
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // User returned to the tab, check session
        checkSession()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [checkSession])

  return {
    getSessionData,
    updateActivity,
    clearSession,
    logout,
    checkSession,
    redirectIfAuthenticated,
    forceLogoutOnPublicPage,
    requireAuth,
  }
}

// Helper function to set session after login
export function setSession(data: {
  token: string
  role: string
  userId: number
  userName: string
  division?: string
}) {
  if (typeof window === "undefined") return

  localStorage.setItem(SESSION_KEYS.TOKEN, data.token)
  localStorage.setItem(SESSION_KEYS.ROLE, data.role)
  localStorage.setItem(SESSION_KEYS.USER_ID, data.userId.toString())
  localStorage.setItem(SESSION_KEYS.USER_NAME, data.userName)
  localStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, Date.now().toString())
  localStorage.setItem(SESSION_KEYS.SESSION_START, Date.now().toString())

  if (data.division) {
    localStorage.setItem(SESSION_KEYS.DIVISION, data.division)
  }
}
