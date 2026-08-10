"use client"

import { createContext, useContext } from "react"

export interface AdminDashboardContextValue {
  token: string
  userDivision: string
  refreshTrigger: number
  bumpRefresh: () => void
}

export const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null)

export function useAdminDashboard() {
  const ctx = useContext(AdminDashboardContext)
  if (!ctx) {
    throw new Error("useAdminDashboard must be used within the admin dashboard layout")
  }
  return ctx
}
