/**
 * Single source of truth for where uploaded files should be stored.
 *
 * Vercel's serverless filesystem is ephemeral - writes to public/uploads
 * there never get served back, so local disk is only safe to use in a
 * regular long-running dev server. UPLOAD_DRIVER always wins when set
 * explicitly (e.g. UPLOAD_DRIVER=local in .env.local for dev).
 */
export function getUploadDriver(): "local" | "blob" {
  const explicit = process.env.UPLOAD_DRIVER
  if (explicit === "local" || explicit === "blob") return explicit
  return process.env.VERCEL ? "blob" : "local"
}
