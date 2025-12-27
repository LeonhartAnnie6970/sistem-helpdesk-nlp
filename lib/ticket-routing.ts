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
      // Fallback: jika tidak ada mapping, return general
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
 * Create notifications for all relevant admins
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
    const admins = await getAdminsForTicket(userDivision, nlpCategory)
    
    let notificationCount = 0

    for (const admin of admins) {
      // Create notification dengan reason
      let message = `Tiket baru dari ${userName} (${userDivision})`
      
      if (admin.notification_reason === 'nlp_category') {
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

      notificationCount++
    }

    console.log(`[Routing] Created ${notificationCount} notifications for ticket ${ticketId}`)
    
    return notificationCount
  } catch (error) {
    console.error('[Routing] Error creating notifications:', error)
    return 0
  }
}