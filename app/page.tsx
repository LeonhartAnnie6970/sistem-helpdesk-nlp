"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import { Brain, BarChart3, Users, Shield, ArrowRight, Building2, Sparkles } from "lucide-react"
import { useSession } from "@/hooks/useSession"

function HomeContent() {
  const router = useRouter()
  const { redirectIfAuthenticated } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showLoginMessage, setShowLoginMessage] = useState(false)

  useEffect(() => {
    const logoutReason = sessionStorage.getItem("logoutReason")
    if (logoutReason) {
      setShowLoginMessage(true)
      sessionStorage.removeItem("logoutReason")
      setIsChecking(false)
      return
    }

    // Redirect to dashboard if already logged in
    const redirected = redirectIfAuthenticated()
    if (!redirected) {
      setIsChecking(false)
    }
  }, [redirectIfAuthenticated])

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push("/login")
  }

  if (isChecking) {
    return (
      <main className="h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-white/80 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Memeriksa sesi...
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen overflow-hidden flex flex-col">
      {/* Blue Hero Section - Top */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex-shrink-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8">
          {/* Hero Content */}
          <div className="text-center pb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span className="text-blue-100 text-xs font-medium">Powered by AI & NLP Technology</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
              Sistem Helpdesk &<br />
              <span className="text-blue-200">Monitoring Divisi</span>
            </h1>

            <p className="text-sm md:text-base text-blue-100 mb-5 max-w-xl mx-auto leading-relaxed">
              Platform tiket cerdas dengan klasifikasi otomatis berbasis AI untuk koordinasi antar divisi yang efisien
            </p>

            {showLoginMessage && (
              <div className="mb-4 inline-block p-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg text-xs text-yellow-100">
                Sesi Anda telah berakhir. Silakan login kembali.
              </div>
            )}

            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-blue-900/30 px-6 py-5 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk ke Sistem
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      {/* White Features Section - Bottom */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        <div className="container mx-auto px-6 py-6 flex-1 flex flex-col justify-center">
          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-4 shadow-md shadow-gray-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-center">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Klasifikasi NLP</h3>
              <p className="text-gray-500 text-xs leading-relaxed">AI analisis tiket otomatis</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-4 shadow-md shadow-gray-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-center">
              <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Monitoring Real-time</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Dashboard performa divisi</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-4 shadow-md shadow-gray-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-center">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Role-Based Access</h3>
              <p className="text-gray-500 text-xs leading-relaxed">3 tingkat hak akses</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-4 shadow-md shadow-gray-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-center">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Export Laporan</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Excel/PDF dengan analisis</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 py-4">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">PT. SINAR JAYA PRIMA LANGGENG</p>
                  <p className="text-gray-400 text-[10px]">Sistem Helpdesk & Monitoring Divisi</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} All Rights Reserved
              </p>
            </div>
          </div>
        </footer>
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
