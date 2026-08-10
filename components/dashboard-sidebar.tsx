"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  onLogout: () => void
  onOpenProfile: () => void
  onOpenNotifications: () => void
  notificationCount?: number
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({
  role,
  onLogout,
  onOpenProfile,
  onOpenNotifications,
  notificationCount = 0,
  collapsed: externalCollapsed,
  onCollapsedChange
}: SidebarProps) {
  const pathname = usePathname()
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
    { href: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/dashboard/tickets", label: "Kelola Tiket", icon: Ticket },
    { href: "/admin/dashboard/create-ticket", label: "Buat Tiket", icon: FileText },
  ]

  const userMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/my-tickets", label: "Tiket Saya", icon: FileText },
  ]

  const superAdminMenuItems = [
    { href: "/super-admin/dashboard/monitoring", label: "Division Monitoring", icon: Shield },
    { href: "/super-admin/dashboard/tickets", label: "All Tickets", icon: Ticket },
    { href: "/super-admin/dashboard/users", label: "User Management", icon: Users },
    { href: "/super-admin/dashboard/create-ticket", label: "Buat Tiket", icon: FileText },
  ]

  const menuItems =
    role === "super_admin" ? superAdminMenuItems :
    role === "admin" ? adminMenuItems :
    userMenuItems

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-blue-900/50 bg-gradient-to-b from-slate-900 to-blue-950 flex flex-col shadow-xl shadow-blue-950/50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-blue-800/30 flex-shrink-0">
        {!collapsed && (
          <h2 className="text-lg font-bold text-white">
            {role === "super_admin" ? "Super Admin" :
             role === "admin" ? "Admin Panel" :
             "User Dashboard"}
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapsed}
          className={cn("text-blue-200 hover:text-white hover:bg-blue-800/50", collapsed ? "" : "ml-auto")}
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
          const isActive = pathname === item.href

          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30"
                  : "text-blue-200 hover:text-white hover:bg-blue-800/50",
                collapsed && "justify-center px-2"
              )}
            >
              <Link href={item.href}>
                <Icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-blue-800/30" />

      {/* Footer Actions */}
      <div className="p-4 space-y-2 flex-shrink-0">
        {/* Notifications */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start relative text-blue-200 hover:text-white hover:bg-blue-800/50",
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
            "w-full justify-start text-blue-200 hover:text-white hover:bg-blue-800/50",
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
            "w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/30",
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