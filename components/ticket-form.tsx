  "use client"

  import type React from "react"

  import { useState, useEffect, useCallback, useRef } from "react"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Textarea } from "@/components/ui/textarea"
  import { Badge } from "@/components/ui/badge"
  import { ImageUpload } from "./image-upload"

  interface TicketFormProps {
    onSuccess?: () => void
  }

  export function TicketForm({ onSuccess }: TicketFormProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [predictedCategory, setPredictedCategory] = useState<string | null>(null)
    const [classifyingText, setClassifyingText] = useState(false)
    const [imageUserUrl, setImageUserUrl] = useState<string | null>(null)
    const [imageUserPreview, setImageUserPreview] = useState<string | null>(null)

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Classify text function with debounce
    const classifyText = useCallback(async (textToClassify: string) => {
      if (textToClassify.length < 10) {
        setPredictedCategory(null)
        return
      }

      setClassifyingText(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/nlp/classify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: textToClassify }),
        })

        if (response.ok) {
          const data = await response.json()
          setPredictedCategory(data.category)
        }
      } catch (err) {
        console.error("Classification error:", err)
      } finally {
        setClassifyingText(false)
      }
    }, [])

    // Auto-classify when title or description changes (with debounce)
    useEffect(() => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      const combinedText = `${title} ${description}`.trim()

      if (combinedText.length >= 10) {
        // Debounce: wait 500ms after user stops typing
        debounceTimerRef.current = setTimeout(() => {
          classifyText(combinedText)
        }, 500)
      } else {
        setPredictedCategory(null)
      }

      // Cleanup
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    }, [title, description, classifyText])

    const handleImageUpload = (url: string, filename: string) => {
      setImageUserUrl(url)
      setImageUserPreview(url)
    }

    const handleRemoveImage = () => {
      setImageUserUrl(null)
      setImageUserPreview(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setSuccess("")
      setIsLoading(true)

      try {
        const token = localStorage.getItem("token")

        // Send as JSON instead of FormData
        const response = await fetch("/api/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            imageUserUrl: imageUserUrl || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Failed to create ticket")
          return
        }

        setSuccess("Tiket berhasil dibuat!")
        setTitle("")
        setDescription("")
        setImageUserUrl(null)
        setImageUserPreview(null)
        setPredictedCategory(null)

        if (onSuccess) {
          onSuccess()
        }
      } catch (err) {
        console.error("Submit error:", err)
        setError("An error occurred. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-black dark:text-white">Buat Tiket Baru</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Laporkan masalah atau pertanyaan Anda</CardDescription>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">{error}</div>}
            {success && <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm rounded">{success}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Judul</label>
              <Input
                placeholder="Ringkas masalah Anda"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Deskripsi</label>
              <Textarea
                placeholder="Jelaskan masalah secara detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                disabled={isLoading}
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            {predictedCategory && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Kategori yang diprediksi:</p>
                <Badge className="bg-blue-600 text-white">{predictedCategory}</Badge>
                {classifyingText && <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">Menganalisis...</span>}
              </div>
            )}

            <ImageUpload
              label="Bukti Laporan"
              description="Tambahkan screenshot atau gambar sebagai bukti laporan Anda (opsional)"
              uploadType="user_report"
              onImageUpload={handleImageUpload}
              onImageRemove={handleRemoveImage}
              previewUrl={imageUserPreview}
              isLoading={isLoading}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Membuat..." : "Buat Tiket"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }