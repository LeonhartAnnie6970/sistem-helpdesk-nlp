"use client"

import { useState, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TicketSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function TicketSearchBar({
  onSearch,
  placeholder = "Cari tiket berdasarkan judul, deskripsi, kategori, atau nama user...",
}: TicketSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value)
      onSearch(value)
    },
    [onSearch],
  )

  const handleClear = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      {searchQuery && (
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
