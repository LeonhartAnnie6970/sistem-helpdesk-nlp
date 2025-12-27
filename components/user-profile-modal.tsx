"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Eye, EyeOff, Save, Edit2, Camera, Loader2 } from 'lucide-react'
import { DIVISIONS } from "@/lib/divisions"

interface UserProfile {
  id: number
  username: string
  email: string
  division: string
  profile_image_url?: string
  created_at: string
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  token: string
}

export function UserProfileModal({ isOpen, onClose, token }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDark, setIsDark] = useState(false)

  const [username, setUsername] = useState("")
  const [division, setDivisi] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
    }
  }, [isOpen])

  useEffect(() => {
    // Detect theme changes
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Gagal mengambil profil")
      }

      const data = await response.json()
      setProfile(data)
      setUsername(data.username)
      setDivisi(data.division)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, GIF, dll)")
      return
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB")
      return
    }

    try {
      setUploadingImage(true)
      setError("")
      setSuccess("")

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Gagal upload gambar")
      }

      const data = await response.json()
      
      // Update profile state dengan URL gambar baru
      setProfile((prev) => (prev ? { ...prev, profile_image_url: data.url } : null))
      setSuccess("Foto profil berhasil diupdate!")
      
      // Clear success message setelah 3 detik
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload gambar")
    } finally {
      setUploadingImage(false)
      // Reset input file
      e.target.value = ""
    }
  }

  const handleUpdateProfile = async () => {
    if (username.length < 3) {
      setError("Username harus minimal 3 karakter")
      return
    }

    if (!division) {
      setError("Divisi harus dipilih")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, division }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Gagal update profil")
      }

      const data = await response.json()
      setProfile(data)
      setIsEditing(false)
      setSuccess("Profil berhasil diupdate!")
      
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update profil")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Semua field harus diisi")
      return
    }

    if (newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Gagal mengubah password")
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess("Password berhasil diubah!")
      
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah password")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setUsername(profile.username)
      setDivisi(profile.division)
    }
    setIsEditing(false)
    setError("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-gray-200 dark:border-gray-700" style={{ backgroundColor: isDark ? 'black' : 'white' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: isDark ? 'black' : 'white' }}>
          <div>
            <CardTitle className="text-black dark:text-white">Profil Pengguna</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Kelola pengaturan akun dan profil Anda</CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            disabled={loading || uploadingImage}
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="max-h-[70vh] overflow-y-auto" style={{ backgroundColor: isDark ? 'black' : 'white' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-start">
              <span className="flex-1">{error}</span>
              <button onClick={() => setError("")} className="ml-2 text-red-700 hover:text-red-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-start">
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess("")} className="ml-2 text-green-700 hover:text-green-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading && !profile ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Memuat profil...</p>
            </div>
          ) : profile ? (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-600 dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=inactive]:text-gray-400 font-semibold"
                >
                  Profil
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-600 dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=inactive]:text-gray-400 font-semibold"
                >
                  Ubah Password
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-32 h-32 group">
                    {profile.profile_image_url ? (
                      <img
                        src={profile.profile_image_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-4 border-gray-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white dark:border-gray-800">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Upload overlay */}
                    {uploadingImage ? (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    ) : (
                      <label className="absolute bottom-0 right-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-2.5 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl hover:scale-110 active:scale-95 border-3 border-white dark:border-gray-900">
                        <Camera className="w-5 h-5 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          disabled={loading || uploadingImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {uploadingImage ? "Mengupload foto..." : "Klik ikon kamera untuk mengubah foto profil"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Format: JPG, PNG, GIF (Max. 5MB)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-black dark:text-white">Nama Pengguna</Label>
                    {isEditing ? (
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="mt-1 bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600"
                        placeholder="Masukkan nama pengguna"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-black dark:text-white font-medium">
                        {profile.username}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-black dark:text-white">Divisi</Label>
                    {isEditing ? (
                      <Select value={division} onValueChange={setDivisi} disabled={loading}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Pilih divisi" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                          {DIVISIONS.map((div) => (
                            <SelectItem key={div} value={div} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                              {div}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-semibold shadow-sm">
                          {profile.division}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-black dark:text-white">Email</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 mt-1 text-black dark:text-white font-medium">
                      {profile.email}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-black dark:text-white">Bergabung Sejak</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 mt-1 text-black dark:text-white font-medium">
                      {new Date(profile.created_at).toLocaleDateString("id-ID", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={loading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          variant="outline"
                          className="flex-1 border-gray-300 text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800 font-semibold"
                        >
                          Batal
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profil
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="password" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password" className="text-sm font-semibold text-black dark:text-white">
                      Password Saat Ini
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Masukkan password saat ini"
                        disabled={loading}
                        className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-black dark:text-white"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password" className="text-sm font-semibold text-black dark:text-white">
                      Password Baru
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan password baru (min 6 karakter)"
                        disabled={loading}
                        className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-black dark:text-white"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="text-sm font-semibold text-black dark:text-white">
                      Konfirmasi Password Baru
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Konfirmasi password baru"
                        disabled={loading}
                        className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-black dark:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Ubah Password"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}