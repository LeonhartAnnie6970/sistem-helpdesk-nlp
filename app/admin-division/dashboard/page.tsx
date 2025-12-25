"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AdminDivisionTickets } from "@/components/admin-division-tickets"
import { UserProfileModal } from "@/components/user-profile-modal"
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"

export default function AdminDivisionDashboard() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>("")
  const [userDivision, setUserDivision] = useState<string>("")
  const [userToken, setUserToken] = useState<string>("")
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setUserToken(token)

    // Verify user is admin
    fetch("/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.role !== "admin") {
          router.push("/dashboard")
        } else {
          setUserRole(data.role)
          setUserDivision(data.divisi)
        }
      })
      .catch(() => router.push("/login"))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Admin - {userDivision}</h1>
            <p className="text-sm text-muted-foreground">Kelola tiket divisi Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminNotificationsPanel token={userToken} />
            <Button variant="outline" onClick={() => setShowProfile(true)}>
              Profil
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tickets">Kelola Tiket</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <AdminDivisionTickets userRole={userRole} userDivision={userDivision} />
          </TabsContent>
        </Tabs>
      </main>

      {showProfile && <UserProfileModal isOpen={showProfile} token={userToken} onClose={() => setShowProfile(false)} />}
    </div>
  )
}
