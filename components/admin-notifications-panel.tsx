"use client"

import { useEffect, useState } from "react"
import { Bell, X, CheckCheck } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Notification {
  id: number
  ticket_title: string
  user_name: string
  divisi: string
  message: string
  is_read: boolean
  created_at: string
}

interface AdminNotificationsPanelProps {
  token: string
}

export function AdminNotificationsPanel({ token }: AdminNotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setUnreadCount(data.unreadCount)
      setNotifications(data.notifications)
    } catch (error) {
      console.error("[v0] Error fetching notifications:", error)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      })
      fetchNotifications()
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications/mark-all-read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchNotifications()
    } catch (error) {
      console.error("[v0] Error marking all as read:", error)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto shadow-lg z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifikasi ({unreadCount})</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Tandai Semua
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href="/admin/dashboard"
                  onClick={() => {
                    handleMarkAsRead(notif.id)
                    setIsOpen(false)
                  }}
                >
                  <div
                    className={`p-3 hover:bg-accent cursor-pointer transition ${
                      !notif.is_read ? "bg-blue-50 dark:bg-blue-950" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notif.ticket_title}</p>
                        <p className="text-xs text-muted-foreground">
                          Dari: {notif.user_name} ({notif.divisi})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.created_at).toLocaleString("id-ID")}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
