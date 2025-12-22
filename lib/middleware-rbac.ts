import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"
import { isSuperAdmin, isAdmin } from "./rbac"

export function withSuperAdminAuth(handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !isSuperAdmin(decoded.role)) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 })
    }
    ;(req as any).user = decoded
    return handler(req, context)
  }
}

export function withAdminOrSuperAdminAuth(handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (!isSuperAdmin(decoded.role) && !isAdmin(decoded.role))) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }
    ;(req as any).user = decoded
    return handler(req, context)
  }
}
