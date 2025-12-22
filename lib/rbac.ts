export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export function isSuperAdmin(role: string): boolean {
  return role === ROLES.SUPER_ADMIN
}

export function isAdmin(role: string): boolean {
  return role === ROLES.ADMIN
}

export function isUser(role: string): boolean {
  return role === ROLES.USER
}

export function canManageUsers(role: string): boolean {
  return isSuperAdmin(role)
}

export function canManageTickets(role: string): boolean {
  return isSuperAdmin(role) || isAdmin(role)
}

export function canOverrideNLP(role: string): boolean {
  return isSuperAdmin(role) || isAdmin(role)
}

export function canViewAllTickets(role: string): boolean {
  return isSuperAdmin(role)
}

export function canViewDivisionTickets(role: string, userDivision: string, ticketDivision: string): boolean {
  if (isSuperAdmin(role)) return true
  if (isAdmin(role) && userDivision === ticketDivision) return true
  return false
}

export function canEditUser(role: string): boolean {
  return isSuperAdmin(role)
}

export function canGenerateReports(role: string): boolean {
  return isSuperAdmin(role) || isAdmin(role)
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "Super Admin"
    case ROLES.ADMIN:
      return "Admin Divisi"
    case ROLES.USER:
      return "User"
    default:
      return "Unknown"
  }
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "bg-purple-500"
    case ROLES.ADMIN:
      return "bg-blue-500"
    case ROLES.USER:
      return "bg-gray-500"
    default:
      return "bg-gray-400"
  }
}
