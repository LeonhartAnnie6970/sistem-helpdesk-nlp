"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck,
  Building2,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number
  name: string
  email: string
  division: string
  role: 'user' | 'admin' | 'super_admin'
  is_active: boolean
  created_at: string
  last_login?: string
  profile_image_url?: string
}

const DIVISIONS = [
  'IT',
  'ACC/FINANCE',
  'OPERASIONAL',
  'SALES',
  'CUSTOMER SERVICE',
  'HR',
  'DIREKSI/DIREKTUR'
]

const ROLES = [
  { value: 'user', label: 'User', icon: Users },
  { value: 'admin', label: 'Admin', icon: Shield },
  { value: 'super_admin', label: 'Super Admin', icon: ShieldCheck }
]

export function SuperAdminUserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterDivision, setFilterDivision] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    division: '',
    role: 'user' as 'user' | 'admin' | 'super_admin'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchQuery, filterRole, filterDivision, filterStatus])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/super-admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Search
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter(user => user.role === filterRole)
    }

    // Division filter
    if (filterDivision !== "all") {
      filtered = filtered.filter(user => user.division === filterDivision)
    }

    // Status filter
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active"
      filtered = filtered.filter(user => user.is_active === isActive)
    }

    setFilteredUsers(filtered)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }

    if (!selectedUser && !formData.password) {
      errors.password = "Password is required"
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (!formData.division) {
      errors.division = "Division is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      division: '',
      role: 'user'
    })
    setFormErrors({})
    setSelectedUser(null)
  }

  const handleAddUser = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully"
        })
        setIsAddDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser || !validateForm()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/super-admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...formData
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully"
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/super-admin/users?userId=${selectedUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully"
        })
        setIsDeleteDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password
      division: user.division,
      role: user.role
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const getRoleIcon = (role: string) => {
    const roleConfig = ROLES.find(r => r.value === role)
    const Icon = roleConfig?.icon || Users
    return <Icon className="w-4 h-4" />
  }

  const getRoleBadgeVariant = (role: string): any => {
    switch (role) {
      case 'super_admin':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="text-gray-600 dark:text-gray-300">Total Users</CardDescription>
            <CardTitle className="text-3xl text-black dark:text-white">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4" />
              Active
            </CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">{stats.active}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <XCircle className="w-4 h-4" />
              Inactive
            </CardDescription>
            <CardTitle className="text-3xl text-red-600 dark:text-red-400">{stats.inactive}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <ShieldCheck className="w-4 h-4" />
              Super Admins
            </CardDescription>
            <CardTitle className="text-3xl text-purple-600 dark:text-purple-400">{stats.superAdmins}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Shield className="w-4 h-4" />
              Admins
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">{stats.admins}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 bg-white dark:bg-black">
            <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4" />
              Users
            </CardDescription>
            <CardTitle className="text-3xl text-gray-600 dark:text-gray-300">{stats.users}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-black dark:text-white">User Management</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Manage users, admins, and super admins
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 bg-white dark:bg-black">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-black dark:text-white">Search</Label>
              <Input
                placeholder="Name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-black dark:text-white">Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                  <SelectItem value="all" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">All Roles</SelectItem>
                  <SelectItem value="super_admin" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Super Admin</SelectItem>
                  <SelectItem value="admin" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Admin</SelectItem>
                  <SelectItem value="user" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-black dark:text-white">Division</Label>
              <Select value={filterDivision} onValueChange={setFilterDivision}>
                <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                  <SelectItem value="all" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">All Divisions</SelectItem>
                  {DIVISIONS.map(div => (
                    <SelectItem key={div} value={div} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-black dark:text-white">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                  <SelectItem value="all" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">All Status</SelectItem>
                  <SelectItem value="active" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Active</SelectItem>
                  <SelectItem value="inactive" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-black dark:text-white">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="bg-white dark:bg-black">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No users found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <Card key={user.id} className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 bg-white dark:bg-black">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-black dark:text-white">{user.name}</h3>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                              {getRoleIcon(user.role)}
                              {user.role.replace('_', ' ')}
                            </Badge>
                            {user.is_active ? (
                              <Badge variant="outline" className="gap-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {user.division}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Add New User</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Create a new user, admin, or super admin account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name" className="text-black dark:text-white font-semibold">Name *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="add-email" className="text-black dark:text-white font-semibold">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {formErrors.email && (
                <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="add-password" className="text-black dark:text-white font-semibold">Password *</Label>
              <Input
                id="add-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {formErrors.password && (
                <p className="text-sm text-destructive mt-1">{formErrors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="add-division" className="text-black dark:text-white font-semibold">Division *</Label>
              <Select
                value={formData.division}
                onValueChange={(value) => setFormData({ ...formData, division: value })}
              >
                <SelectTrigger id="add-division" className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                  {DIVISIONS.map(div => (
                    <SelectItem key={div} value={div} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.division && (
                <p className="text-sm text-destructive mt-1">{formErrors.division}</p>
              )}
            </div>

            <div>
              <Label htmlFor="add-role" className="text-black dark:text-white font-semibold">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="add-role" className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                  {ROLES.map(role => {
                    const Icon = role.icon
                    return (
                      <SelectItem key={role.value} value={role.value} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {role.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                resetForm()
              }}
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Edit User</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Update user information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-black dark:text-white font-semibold">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-email" className="text-black dark:text-white font-semibold">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
              {formErrors.email && (
                <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-password" className="text-black dark:text-white font-semibold">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current"
                className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {formErrors.password && (
                <p className="text-sm text-destructive mt-1">{formErrors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-division" className="text-black dark:text-white font-semibold">Division *</Label>
              <Select
                value={formData.division}
                onValueChange={(value) => setFormData({ ...formData, division: value })}
              >
                <SelectTrigger id="edit-division" className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                  {DIVISIONS.map(div => (
                    <SelectItem key={div} value={div} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.division && (
                <p className="text-sm text-destructive mt-1">{formErrors.division}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-role" className="text-black dark:text-white font-semibold">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="edit-role" className="bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                  {ROLES.map(role => {
                    const Icon = role.icon
                    return (
                      <SelectItem key={role.value} value={role.value} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {role.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                resetForm()
              }}
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {submitting ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              This will permanently delete the user <strong className="text-black dark:text-white">{selectedUser?.name}</strong> ({selectedUser?.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                resetForm()
              }}
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}