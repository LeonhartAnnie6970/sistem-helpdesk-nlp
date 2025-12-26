"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Upload, Eye, EyeOff, LogOut, Save, Edit2, Camera, Loader2 } from 'lucide-react'
import { DIVISIONS } from "@/lib/divisions"

interface UserProfile {
  id: number
  username: string
  email: string
  divisi: string
  profile_image_url?: string
  created_at: string
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  token: string
}

export function UserProfileModal({ isOpen, onClose, token }: UserProfileModalProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [username, setUsername] = useState("")
  const [divisi, setDivisi] = useState("")
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
      setDivisi(data.divisi)
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

    if (!divisi) {
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
        body: JSON.stringify({ username, divisi }),
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

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    onClose()
    router.push("/login")
  }

  const handleCancelEdit = () => {
    if (profile) {
      setUsername(profile.username)
      setDivisi(profile.divisi)
    }
    setIsEditing(false)
    setError("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Profil Pengguna</CardTitle>
            <CardDescription>Kelola pengaturan akun dan profil Anda</CardDescription>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading || uploadingImage}
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="max-h-[70vh] overflow-y-auto">
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="password">Ubah Password</TabsTrigger>
                <TabsTrigger value="logout">Logout</TabsTrigger>
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
                      <div className="w-full h-full rounded-full bg: gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Upload overlay */}
                    {uploadingImage ? (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    ) : (
                      <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2.5 cursor-pointer hover:bg-blue-600 transition-all shadow-lg hover:scale-110 active:scale-95">
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
                    <p className="text-xs text-muted-foreground">
                      {uploadingImage ? "Mengupload foto..." : "Klik ikon kamera untuk mengubah foto profil"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: JPG, PNG, GIF (Max. 5MB)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nama Pengguna</Label>
                    {isEditing ? (
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="mt-1"
                        placeholder="Masukkan nama pengguna"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        {profile.username}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Divisi</Label>
                    {isEditing ? (
                      <Select value={divisi} onValueChange={setDivisi} disabled={loading}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Pilih divisi" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIVISIONS.map((div) => (
                            <SelectItem key={div} value={div}>
                              {div}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                          {profile.divisi}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="p-3 bg-gray-50 rounded-md border mt-1 text-gray-600">
                      {profile.email}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Bergabung Sejak</Label>
                    <div className="p-3 bg-gray-50 rounded-md border mt-1 text-gray-600">
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
                          className="flex-1"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          variant="outline"
                          className="flex-1"
                        >
                          Batal
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full"
                        variant="outline"
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
                    <Label htmlFor="current-password" className="text-sm font-medium">
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
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
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
                    <Label htmlFor="new-password" className="text-sm font-medium">
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
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
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
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
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
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
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
                    className="w-full"
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

              <TabsContent value="logout" className="space-y-4 mt-4">
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <LogOut className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Konfirmasi Logout</h3>
                    <p className="text-gray-600">
                      Apakah Anda yakin ingin logout? Anda akan diarahkan ke halaman login.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleLogout}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Ya, Logout
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}