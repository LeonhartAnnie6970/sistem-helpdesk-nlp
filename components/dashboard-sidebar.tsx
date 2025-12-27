// "use client"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { 
//   Home, 
//   Ticket, 
//   Users, 
//   BarChart3, 
//   FileText, 
//   Settings,
//   Shield,
//   Building2,
//   LogOut,
//   ChevronLeft,
//   ChevronRight
// } from "lucide-react"
// import { useRouter, usePathname } from "next/navigation"
// import { useState } from "react"

// interface DashboardSidebarProps {
//   role: "user" | "admin" | "super_admin"
//   division?: string
//   onLogout: () => void
// }

// export function DashboardSidebar({ role, division, onLogout }: DashboardSidebarProps) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const [collapsed, setCollapsed] = useState(false)

//   const userNavItems = [
//     { icon: Home, label: "Dashboard", href: "/dashboard" },
//     { icon: Ticket, label: "Tiket Saya", href: "/dashboard" },
//     { icon: Settings, label: "Pengaturan", href: "/dashboard/settings" },
//   ]

//   const adminNavItems = [
//     { icon: Home, label: "Dashboard", href: "/admin-division/dashboard" },
//     { icon: Ticket, label: "Kelola Tiket", href: "/admin-division/dashboard" },
//     { icon: BarChart3, label: "Statistik", href: "/admin-division/stats" },
//     { icon: Building2, label: `Divisi ${division}`, href: "/admin-division/division" },
//   ]

//   const superAdminNavItems = [
//     { icon: Home, label: "Dashboard", href: "/super-admin/dashboard" },
//     { icon: Shield, label: "Monitoring Divisi", href: "/super-admin/dashboard" },
//     { icon: Users, label: "Kelola Users", href: "/super-admin/users" },
//     { icon: Ticket, label: "Semua Tiket", href: "/super-admin/tickets" },
//     { icon: BarChart3, label: "Analytics", href: "/super-admin/analytics" },
//     { icon: FileText, label: "Laporan NLP", href: "/super-admin/reports" },
//   ]

//   const navItems = 
//     role === "super_admin" ? superAdminNavItems :
//     role === "admin" ? adminNavItems :
//     userNavItems

//   return (
//     <div className={cn(
//       "relative border-r bg-background transition-all duration-300",
//       collapsed ? "w-16" : "w-64"
//     )}>
//       <div className="flex h-16 items-center border-b px-4">
//         {!collapsed && (
//           <div className="flex items-center gap-2">
//             {role === "super_admin" && <Shield className="h-6 w-6 text-purple-600" />}
//             {role === "admin" && <Building2 className="h-6 w-6 text-blue-600" />}
//             {role === "user" && <Home className="h-6 w-6 text-green-600" />}
//             <span className="font-bold text-lg">
//               {role === "super_admin" ? "Super Admin" : 
//                role === "admin" ? division : 
//                "Dashboard"}
//             </span>
//           </div>
//         )}
//       </div>

//       <Button
//         variant="ghost"
//         size="icon"
//         className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border bg-background"
//         onClick={() => setCollapsed(!collapsed)}
//       >
//         {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
//       </Button>

//       <ScrollArea className="h-[calc(100vh-4rem)]">
//         <div className="space-y-1 p-2">
//           {navItems.map((item) => {
//             const Icon = item.icon
//             const isActive = pathname === item.href
            
//             return (
//               <Button
//                 key={item.href}
//                 variant={isActive ? "secondary" : "ghost"}
//                 className={cn(
//                   "w-full justify-start gap-2",
//                   collapsed && "justify-center px-2"
//                 )}
//                 onClick={() => router.push(item.href)}
//               >
//                 <Icon className="h-5 w-5 shrink-0" />
//                 {!collapsed && <span>{item.label}</span>}
//               </Button>
//             )
//           })}

//           <div className="pt-4 mt-4 border-t">
//             <Button
//               variant="ghost"
//               className={cn(
//                 "w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50",
//                 collapsed && "justify-center px-2"
//               )}
//               onClick={onLogout}
//             >
//               <LogOut className="h-5 w-5 shrink-0" />
//               {!collapsed && <span>Keluar</span>}
//             </Button>
//           </div>
//         </div>
//       </ScrollArea>
//     </div>
//   )
// }

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
  ]

  const userMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-tickets", label: "Tiket Saya", icon: FileText },
  ]

  const superAdminMenuItems = [
    { id: "monitoring", label: "Division Monitoring", icon: Shield },
    { id: "tickets", label: "All Tickets", icon: Ticket },
    { id: "users", label: "User Management", icon: Users },
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