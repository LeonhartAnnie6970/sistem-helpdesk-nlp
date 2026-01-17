"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Ticket,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  FileText,
  Shield,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role: "admin" | "user" | "super_admin"
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  onOpenProfile: () => void
  onOpenNotifications: () => void
  notificationCount?: number
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({
  role,
  activeTab,
  onTabChange,
  onLogout,
  onOpenProfile,
  onOpenNotifications,
  notificationCount = 0,
  collapsed: externalCollapsed,
  onCollapsedChange
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  // Use external collapsed state if provided, otherwise use internal state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed

  const handleToggleCollapsed = () => {
    const newCollapsed = !collapsed
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed)
    } else {
      setInternalCollapsed(newCollapsed)
    }
  }

  const adminMenuItems = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "tickets", label: "Kelola Tiket", icon: Ticket },
    { id: "create-ticket", label: "Buat Tiket", icon: FileText },
  ]

  const userMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-tickets", label: "Tiket Saya", icon: FileText },
  ]

  const superAdminMenuItems = [
    { id: "monitoring", label: "Division Monitoring", icon: Shield },
    { id: "tickets", label: "All Tickets", icon: Ticket },
    { id: "users", label: "User Management", icon: Users },
    { id: "create-ticket", label: "Buat Tiket", icon: FileText },
  ]

  const menuItems =
    role === "super_admin" ? superAdminMenuItems :
    role === "admin" ? adminMenuItems :
    userMenuItems

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r bg-background flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink: 0">
        {!collapsed && (
          <h2 className="text-lg font-bold">
            {role === "super_admin" ? "Super Admin" :
             role === "admin" ? "Admin Panel" :
             "User Dashboard"}
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapsed}
          className={cn("", collapsed ? "" : "ml-auto")}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center px-2"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="border-t" />

      {/* Footer Actions */}
      <div className="p-4 space-y-2 flex-shrink: 0">
        {/* Notifications */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start relative",
            collapsed && "justify-center px-2"
          )}
          onClick={onOpenNotifications}
        >
          <div className="relative">
            <Bell className={cn("w-5 h-5", !collapsed && "mr-3")} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {notificationCount > 9 ? "9" : notificationCount}
              </span>
            )}
          </div>
          {!collapsed && <span>Notifikasi</span>}
        </Button>

        {/* Profile */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            collapsed && "justify-center px-2"
          )}
          onClick={onOpenProfile}
        >
          <User className={cn("w-5 h-5", !collapsed && "mr-3")} />
          {!collapsed && <span>Profil</span>}
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
          onClick={onLogout}
        >
          <LogOut className={cn("w-5 h-5", !collapsed && "mr-3")} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}