"use client"

import { createContext, useContext } from "react"

export interface SuperAdminDashboardContextValue {
  token: string
  refreshTrigger: number
  bumpRefresh: () => void
}

export const SuperAdminDashboardContext = createContext<SuperAdminDashboardContextValue | null>(null)

export function useSuperAdminDashboard() {
  const ctx = useContext(SuperAdminDashboardContext)
  if (!ctx) {
    throw new Error("useSuperAdminDashboard must be used within the super admin dashboard layout")
  }
  return ctx
}
