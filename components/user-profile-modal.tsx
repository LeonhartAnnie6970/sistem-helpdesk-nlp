"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Upload, Eye, EyeOff, LogOut } from 'lucide-react'

interface UserProfile {
  id: number
  username: string
  email: string
  divisi: string
  role: "admin" | "user"
  profile_image_url?: string
  notification_email?: string
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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [username, setUsername] = useState("")
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  
  const [notificationEmail, setNotificationEmail] = useState("")
  const [isEditingNotificationEmail, setIsEditingNotificationEmail] = useState(false)

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
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Gagal mengambil profil")

      const data = await response.json()
      setProfile(data)
      setUsername(data.username)
      setNotificationEmail(data.notification_email || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error("Gagal upload gambar")

      const data = await response.json()
      setProfile((prev) => (prev ? { ...prev, profile_image_url: data.url } : null))
      setSuccess("Foto profil berhasil diupdate")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload gambar")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUsername = async () => {
    if (username.length < 3) {
      setError("Username harus minimal 3 karakter")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) throw new Error("Gagal update profil")

      const data = await response.json()
      setProfile(data)
      setIsEditingUsername(false)
      setSuccess("Username berhasil diupdate")
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update profil")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotificationEmail = async () => {
    if (!notificationEmail.trim()) {
      setError("Email notifikasi tidak boleh kosong")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(notificationEmail)) {
      setError("Format email tidak valid")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notification_email: notificationEmail }),
      })

      if (!response.ok) throw new Error("Gagal update email notifikasi")

      const data = await response.json()
      setProfile(data)
      setIsEditingNotificationEmail(false)
      setSuccess("Email notifikasi berhasil diupdate")
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update email notifikasi")
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
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      if (!response.ok) throw new Error("Gagal mengubah password")

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess("Password berhasil diubah")
      setError("")
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Profil Pengguna</CardTitle>
            <CardDescription>Kelola pengaturan akun dan profil Anda</CardDescription>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {loading && !profile ? (
            <div className="flex items-center justify-center py-8">Loading...</div>
          ) : profile ? (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="password">Ubah Password</TabsTrigger>
                <TabsTrigger value="logout">Logout</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-32 h-32">
                    {profile.profile_image_url ? (
                      <img
                        src={profile.profile_image_url || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        No Image
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition">
                      <Upload className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nama Pengguna</Label>
                    {isEditingUsername ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                        />
                        <Button
                          size="sm"
                          onClick={handleUpdateUsername}
                          disabled={loading}
                        >
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingUsername(false)
                            setUsername(profile.username)
                          }}
                          disabled={loading}
                        >
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-1 p-2 bg-gray-100 rounded">
                        <span>{profile.username}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingUsername(true)}
                          disabled={loading}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="p-2 bg-gray-100 rounded mt-1 text-gray-600">
                      {profile.email}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Divisi</Label>
                    <div className="p-2 bg-gray-100 rounded mt-1">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {profile.divisi}
                      </span>
                    </div>
                  </div>

                  {profile.role === "admin" && (
                    <div>
                      <Label className="text-sm font-medium">Email Notifikasi</Label>
                      <p className="text-xs text-gray-500 mb-2">Email ini akan menerima notifikasi saat ada tiket baru</p>
                      {isEditingNotificationEmail ? (
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="email"
                            value={notificationEmail}
                            onChange={(e) => setNotificationEmail(e.target.value)}
                            placeholder="Masukkan email untuk notifikasi"
                            disabled={loading}
                          />
                          <Button
                            size="sm"
                            onClick={handleUpdateNotificationEmail}
                            disabled={loading}
                          >
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingNotificationEmail(false)
                              setNotificationEmail(profile.notification_email || "")
                            }}
                            disabled={loading}
                          >
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mt-1 p-2 bg-gray-100 rounded">
                          <span className="text-sm">{notificationEmail || "Belum diatur"}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditingNotificationEmail(true)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Bergabung Sejak</Label>
                    <div className="p-2 bg-gray-100 rounded mt-1 text-gray-600">
                      {new Date(profile.created_at).toLocaleDateString("id-ID")}
                    </div>
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
                        className="p-2 hover:bg-gray-100 rounded"
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
                        className="p-2 hover:bg-gray-100 rounded"
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
                        className="p-2 hover:bg-gray-100 rounded"
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
                    {loading ? "Memproses..." : "Ubah Password"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="logout" className="space-y-4 mt-4">
                <div className="text-center space-y-4">
                  <div className="text-gray-600">
                    Apakah Anda yakin ingin logout? Anda akan diarahkan ke halaman login.
                  </div>
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
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
