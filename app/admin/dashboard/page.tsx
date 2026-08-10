import { redirect } from "next/navigation"

export default function AdminDashboardIndexPage() {
  redirect("/admin/dashboard/analytics")
}
