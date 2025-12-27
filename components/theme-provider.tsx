"use client"

import type React from "react"

import { useEffect, useState } from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage - default to light theme if not set
    const saved = localStorage.getItem("theme")

    if (saved === "dark") {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    } else {
      // Default to light theme
      setIsDark(false)
      document.documentElement.classList.remove("dark")
      // Set default theme to localStorage if not exists
      if (!saved) {
        localStorage.setItem("theme", "light")
      }
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  if (!mounted) return <>{children}</>

  return (
    <div data-theme-provider>
      {children}
      <div
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-lg z-50"
        title="Toggle theme"
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 00-1.414 0l-.707.707a1 1 0 000 1.414l2.12 2.12a1 1 0 001.414 0l.707-.707a1 1 0 000-1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM9 4a1 1 0 100-2 1 1 0 000 2zm6.464 12.05l-2.12-2.12a1 1 0 10-1.414 1.414l2.12 2.12a1 1 0 001.414-1.414l-.707-.707a1 1 0 000-1.414zM9 16a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </div>
    </div>
  )
}
