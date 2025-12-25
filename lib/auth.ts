import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set. Please configure it in .env.local")
}

export function getAuthData() {
  if (typeof window === "undefined") return null

  return {
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    division: localStorage.getItem("division"),
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string }
  } catch {
    return null
  }
}
