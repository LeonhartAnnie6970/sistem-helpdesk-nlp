"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "@/components/theme-provider"
import { Brain, BarChart3, Users, Shield } from "lucide-react"

function HomeContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push("/login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">Sistem Monitoring Divisi dengan NLP</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Platform monitoring dan analisis tiket antar divisi dengan klasifikasi otomatis berbasis AI (NLP) untuk
            meningkatkan efisiensi koordinasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Klasifikasi NLP Otomatis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sistem NLP menganalisis tiket dan menentukan divisi target dengan confidence level yang dapat
                di-override
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Dashboard Monitoring Real-time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Super Admin dapat memantau performa setiap divisi dengan visualisasi data dan statistik lengkap
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Role-Based Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                3 tingkat akses: Super Admin (monitoring semua), Admin Divisi (kelola divisi), User (buat tiket)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Laporan & Analisis NLP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export laporan dengan analisis confidence level, override statistics, dan performa divisi
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Mulai Sekarang</CardTitle>
            <CardDescription>Login untuk mengakses sistem monitoring divisi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleGetStarted} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? "Loading..." : "Login / Daftar"}
            </Button>
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p className="font-semibold">Demo Accounts (lihat database script):</p>
              <p>Super Admin: it@company.com / Direksi001@</p>
              <p>Admin Divisi: admin.acc@company.com / AdminAcc001@</p>
              <p>User: user1@company.com / User001@</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  )
}
