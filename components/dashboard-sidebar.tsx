"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Home, 
  Ticket, 
  Users, 
  BarChart3, 
  FileText, 
  Settings,
  Shield,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

interface DashboardSidebarProps {
  role: "user" | "admin" | "super_admin"
  division?: string
  onLogout: () => void
}

export function DashboardSidebar({ role, division, onLogout }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const userNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Ticket, label: "Tiket Saya", href: "/dashboard" },
    { icon: Settings, label: "Pengaturan", href: "/dashboard/settings" },
  ]

  const adminNavItems = [
    { icon: Home, label: "Dashboard", href: "/admin-division/dashboard" },
    { icon: Ticket, label: "Kelola Tiket", href: "/admin-division/dashboard" },
    { icon: BarChart3, label: "Statistik", href: "/admin-division/stats" },
    { icon: Building2, label: `Divisi ${division}`, href: "/admin-division/division" },
  ]

  const superAdminNavItems = [
    { icon: Home, label: "Dashboard", href: "/super-admin/dashboard" },
    { icon: Shield, label: "Monitoring Divisi", href: "/super-admin/dashboard" },
    { icon: Users, label: "Kelola Users", href: "/super-admin/users" },
    { icon: Ticket, label: "Semua Tiket", href: "/super-admin/tickets" },
    { icon: BarChart3, label: "Analytics", href: "/super-admin/analytics" },
    { icon: FileText, label: "Laporan NLP", href: "/super-admin/reports" },
  ]

  const navItems = 
    role === "super_admin" ? superAdminNavItems :
    role === "admin" ? adminNavItems :
    userNavItems

  return (
    <div className={cn(
      "relative border-r bg-background transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            {role === "super_admin" && <Shield className="h-6 w-6 text-purple-600" />}
            {role === "admin" && <Building2 className="h-6 w-6 text-blue-600" />}
            {role === "user" && <Home className="h-6 w-6 text-green-600" />}
            <span className="font-bold text-lg">
              {role === "super_admin" ? "Super Admin" : 
               role === "admin" ? division : 
               "Dashboard"}
            </span>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border bg-background"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => router.push(item.href)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            )
          })}

          <div className="pt-4 mt-4 border-t">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50",
                collapsed && "justify-center px-2"
              )}
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Keluar</span>}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}