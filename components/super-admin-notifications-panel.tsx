"use client"

import { useEffect, useState } from "react"
import { X, CheckCheck, FileText, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: number
  ticket_id: number
  ticket_title: string
  message: string
  type: 'status_update' | 'admin_note' | 'admin_image' | 'ticket_resolved'
  is_read: boolean
  created_at: string
}

interface UserNotificationsPanelProps {
  token: string
}

export function UserNotificationsPanel({ token }: UserNotificationsPanelProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setUnreadCount(data.unreadCount || 0)
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      })
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/user/notifications/mark-all-read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchNotifications()
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id)
    // Refresh ticket list if needed
    window.location.reload()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'admin_note':
        return <FileText className="w-4 h-4 text-purple-500" />
      case 'admin_image':
        return <ImageIcon className="w-4 h-4 text-green-500" />
      case 'ticket_resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ticket_resolved':
        return 'bg-green-50 dark:bg-green-950 border-l-4 border-l-green-500'
      case 'status_update':
        return 'bg-blue-50 dark:bg-blue-950 border-l-4 border-l-blue-500'
      case 'admin_note':
        return 'bg-purple-50 dark:bg-purple-950 border-l-4 border-l-purple-500'
      case 'admin_image':
        return 'bg-green-50 dark:bg-green-950 border-l-4 border-l-green-500'
      default:
        return ''
    }
  }
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between flex-shrink: 0 bg-background">
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
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Tidak ada notifikasi
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3 hover:bg-accent cursor-pointer transition ${
                !notif.is_read ? getNotificationColor(notif.type) : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink: 0 mt-1">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{notif.ticket_title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(notif.created_at).toLocaleString("id-ID")}
                    </p>
                    {!notif.is_read && (
                      <Badge variant="secondary" className="text-xs">Baru</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}