"use client"

import { createContext, useContext } from "react"

export interface UserDashboardContextValue {
  token: string
  refreshTrigger: number
  bumpRefresh: () => void
}

export const UserDashboardContext = createContext<UserDashboardContextValue | null>(null)

export function useUserDashboard() {
  const ctx = useContext(UserDashboardContext)
  if (!ctx) {
    throw new Error("useUserDashboard must be used within the user dashboard layout")
  }
  return ctx
}
