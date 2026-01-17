// lib/ticket-routing.ts

import { query } from "@/lib/db"

/**
 * Get target divisions berdasarkan NLP category
 */
export async function getTargetDivisionsByCategory(nlpCategory: string): Promise<string[]> {
  try {
    const mappings = await query(
      `SELECT target_division
       FROM category_division_mapping
       WHERE nlp_category = ? AND is_active = TRUE`,
      [nlpCategory]
    )as Array<{ target_division: string }>

    if (mappings.length === 0) {
      // Fallback 1: Cek apakah nlpCategory adalah nama divisi yang valid
      const divisionCheck = await query(
        `SELECT DISTINCT division FROM users WHERE division = ? AND is_active = TRUE`,
        [nlpCategory]
      ) as Array<{ division: string }>

      if (divisionCheck.length > 0) {
        // Kategori NLP sama dengan nama divisi, gunakan langsung
        console.log(`[Routing] No mapping found, but category '${nlpCategory}' is a valid division name`)
        return [nlpCategory]
      }

      // Fallback 2: jika tidak ada mapping dan bukan nama divisi, return general
      console.log(`[Routing] No mapping found for category '${nlpCategory}', falling back to GENERAL`)
      return ['GENERAL']
    }

    return mappings.map(m => m.target_division)
  } catch (error) {
    console.error('[Routing] Error getting target divisions:', error)
    return ['GENERAL']
  }
}

/**
 * Get all divisions yang harus menerima ticket
 * Returns: { userDivision, nlpDivisions, allDivisions }
 */
export async function getTicketRoutingDivisions(
  userDivision: string,
  nlpCategory: string
): Promise<{
  userDivision: string
  nlpDivisions: string[]
  allDivisions: string[]
}> {
  const nlpDivisions = await getTargetDivisionsByCategory(nlpCategory)
  
  // Combine dan remove duplicates
  const allDivisions = Array.from(new Set([
    userDivision,
    ...nlpDivisions
  ]))

  return {
    userDivision,
    nlpDivisions,
    allDivisions
  }
}

/**
 * Get all admins yang harus menerima notifikasi
 */
export async function getAdminsForTicket(
  userDivision: string,
  nlpCategory: string
): Promise<Array<{
  id: number
  name: string
  email: string
  division: string
  role: string
  notification_reason: 'user_division' | 'nlp_category' | 'super_admin'
}>> {
  try {
    const routing = await getTicketRoutingDivisions(userDivision, nlpCategory)
    const admins: any[] = []

    // 1. Get admins from user division
    const userDivisionAdmins = await query(
      `SELECT id, name, email, division, role
       FROM users
       WHERE role = 'admin' AND division = ? AND is_active = TRUE`,
      [userDivision]
    )as Array<{ id: number; name: string; email: string; division: string; role: string }>

    if (userDivisionAdmins && Array.isArray(userDivisionAdmins)) {
      userDivisionAdmins.forEach((admin: any) => {
        admins.push({
          ...admin,
          notification_reason: 'user_division' as const
        })
      })
    }

    // 2. Get admins from NLP category divisions (exclude duplicates)
    for (const division of routing.nlpDivisions) {
      if (division === userDivision) continue // Skip duplicate

      const categoryAdmins = await query(
        `SELECT id, name, email, division, role
         FROM users
         WHERE role = 'admin' AND division = ? AND is_active = TRUE`,
        [division]
      )

      if (categoryAdmins && Array.isArray(categoryAdmins)) {
        categoryAdmins.forEach((admin: any) => {
          // Check if admin already added
          if (!admins.find(a => a.id === admin.id)) {
            admins.push({
              ...admin,
              notification_reason: 'nlp_category' as const
            })
          }
        })
      }
    }

    // 3. Get all super admins
    const superAdmins = await query(
      `SELECT id, name, email, division, role
       FROM users
       WHERE role = 'super_admin' AND is_active = TRUE`
    )

    if (superAdmins && Array.isArray(superAdmins)) {
      superAdmins.forEach((admin: any) => {
        if (!admins.find(a => a.id === admin.id)) {
          admins.push({
            ...admin,
            notification_reason: 'super_admin' as const
          })
        }
      })
    }

    console.log(`[Routing] Found ${admins.length} admins for ticket:`, {
      userDivision,
      nlpCategory,
      userDivisionAdmins: userDivisionAdmins?.length || 0,
      nlpCategoryAdmins: routing.nlpDivisions.length,
      superAdmins: (superAdmins as any[])?.length || 0
    })

    return admins
  } catch (error) {
    console.error('[Routing] Error getting admins:', error)
    return []
  }
}

/**
 * Get all users in target divisions that should receive notifications
 */
export async function getUsersForTicket(
  userDivision: string,
  nlpCategory: string,
  ticketCreatorId: number
): Promise<Array<{
  id: number
  name: string
  email: string
  division: string
  role: string
  notification_reason: 'target_division'
}>> {
  try {
    const routing = await getTicketRoutingDivisions(userDivision, nlpCategory)
    const users: any[] = []

    // Get all users from target divisions (NLP routing)
    for (const division of routing.nlpDivisions) {
      // Get users from this division (excluding ticket creator)
      const divisionUsers = await query(
        `SELECT id, name, email, division, role
         FROM users
         WHERE role = 'user' AND division = ? AND is_active = TRUE AND id != ?`,
        [division, ticketCreatorId]
      )

      if (divisionUsers && Array.isArray(divisionUsers)) {
        divisionUsers.forEach((user: any) => {
          // Check if user already added
          if (!users.find(u => u.id === user.id)) {
            users.push({
              ...user,
              notification_reason: 'target_division' as const
            })
          }
        })
      }
    }

    console.log(`[Routing] Found ${users.length} users for ticket:`, {
      userDivision,
      nlpCategory,
      targetDivisions: routing.nlpDivisions
    })

    return users
  } catch (error) {
    console.error('[Routing] Error getting users:', error)
    return []
  }
}

/**
 * Create notifications for all relevant admins and users
 *
 * Alur notifikasi:
 * 1. Admin dari divisi pembuat tiket (userDivision) -> notifikasi karena user mereka membuat tiket
 * 2. Admin dari divisi tujuan (nlpCategory) -> notifikasi karena tiket ditujukan ke divisi mereka
 * 3. User dari divisi tujuan (nlpCategory) -> notifikasi karena tiket masuk ke divisi mereka
 * 4. Super Admin -> selalu dapat notifikasi semua tiket
 */
export async function createTicketNotifications(
  ticketId: number,
  userId: number,
  userDivision: string,
  nlpCategory: string,
  title: string,
  userName: string
): Promise<number> {
  try {
    console.log(`[Routing] Creating notifications for ticket ${ticketId}:`, {
      userId,
      userDivision,
      nlpCategory,
      title,
      userName
    })

    const admins = await getAdminsForTicket(userDivision, nlpCategory)
    const users = await getUsersForTicket(userDivision, nlpCategory, userId)

    console.log(`[Routing] Recipients found:`, {
      admins: admins.map(a => ({ id: a.id, name: a.name, division: a.division, reason: a.notification_reason })),
      users: users.map(u => ({ id: u.id, name: u.name, division: u.division }))
    })

    let notificationCount = 0

    // Create admin notifications
    for (const admin of admins) {
      // Create notification dengan reason
      let message = `Tiket baru dari ${userName} (${userDivision})`

      if (admin.notification_reason === 'nlp_category') {
        message += ` - Kategori: ${nlpCategory}`
      } else if (admin.notification_reason === 'user_division') {
        message += ` - User dari divisi Anda`
      } else if (admin.notification_reason === 'super_admin') {
        message += ` - Kategori: ${nlpCategory}`
      }

      await query(
        `INSERT INTO notifications
         (id_admin, id_ticket, id_user, title, message, notification_reason, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          admin.id,
          ticketId,
          userId,
          title,
          message,
          admin.notification_reason,
          false
        ]
      )

      console.log(`[Routing] Created admin notification for ${admin.name} (${admin.division}) - reason: ${admin.notification_reason}`)
      notificationCount++
    }

    // Create user notifications for target division users
    for (const user of users) {
      const message = `Tiket baru untuk divisi ${user.division} dari ${userName} (${userDivision}) - Kategori: ${nlpCategory}`

      await query(
        `INSERT INTO user_notifications
         (id_user, id_ticket, ticket_title, message, type, is_read)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          ticketId,
          title,
          message,
          'new_ticket',
          false
        ]
      )

      console.log(`[Routing] Created user notification for ${user.name} (${user.division})`)
      notificationCount++
    }

    console.log(`[Routing] Total ${notificationCount} notifications created for ticket ${ticketId}`)

    return notificationCount
  } catch (error) {
    console.error('[Routing] Error creating notifications:', error)
    return 0
  }
}

/**
 * Check if user is super admin and should receive all tickets
 */
export async function isSuperAdmin(userId: number): Promise<boolean> {
  try {
    const result = await query(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    )
    
    if (Array.isArray(result) && result.length > 0) {
      return (result[0] as any).role === 'super_admin'
    }
    
    return false
  } catch (error) {
    console.error('[Routing] Error checking super admin:', error)
    return false
  }
}