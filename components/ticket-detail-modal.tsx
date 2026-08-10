"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, User, Clock, MessageSquare, Image as ImageIcon, ImageOff, Building2, ShieldCheck, ShieldX, ShieldQuestion } from "lucide-react"
import { format } from "date-fns"
import { formatTicketId } from "@/lib/utils"
import { URGENCY_LEVELS, URGENCY_META, getDeadlineInfo, type Urgency } from "@/lib/urgency"

interface Comment {
  id: number
  ticket_id: number
  user_id: number
  comment: string
  comment_type: string
  old_status: string | null
  new_status: string | null
  attachment_path: string | null
  created_at: string
  user_name: string
  user_email: string
  user_role: string
  user_division: string | null
}

interface Ticket {
  id: number
  id_user: number
  title: string
  description: string
  category: string
  nlp_category?: string
  status: string
  approval_status?: 'not_required' | 'pending' | 'approved' | 'rejected'
  rejection_reason?: string | null
  urgency?: Urgency
  deadline_at?: string | null
  target_divisions: string // JSON array string
  created_at: string
  user_name: string
  user_email: string
  user_division?: string
  image_user_url?: string
  ticket_sequence?: number
}

interface TicketDetailModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: number | null
  onUpdate?: () => void
}

export function TicketDetailModal({ isOpen, onClose, ticketId, onUpdate }: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>("")
  const [currentUserDivision, setCurrentUserDivision] = useState<string>("")
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [approving, setApproving] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())
  const [editingUrgency, setEditingUrgency] = useState(false)
  const [urgencyDraft, setUrgencyDraft] = useState<Urgency>("medium")
  const [savingUrgency, setSavingUrgency] = useState(false)

  useEffect(() => {
    // Get current user info from localStorage
    const userId = localStorage.getItem("userId")
    if (userId) {
      setCurrentUserId(parseInt(userId))
    }
    setCurrentUserRole(localStorage.getItem("role") || "")
    setCurrentUserDivision(localStorage.getItem("division") || "")
  }, [])

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicketDetails()
      fetchComments()
      setShowRejectForm(false)
      setRejectReason("")
      setBrokenImages(new Set())
      setEditingUrgency(false)
    }
  }, [isOpen, ticketId])

  const canEditUrgency = currentUserRole === "admin" || currentUserRole === "super_admin"

  const handleSaveUrgency = async () => {
    if (!ticket) return
    try {
      setSavingUrgency(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ urgency: urgencyDraft }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "Gagal mengubah urgensi tiket")
        return
      }

      setEditingUrgency(false)
      fetchTicketDetails()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error("Error saving urgency:", error)
      alert("Terjadi kesalahan saat mengubah urgensi tiket")
    } finally {
      setSavingUrgency(false)
    }
  }

  const markImageBroken = (key: string) => {
    setBrokenImages((prev) => new Set(prev).add(key))
  }

  // Check if current user is the ticket creator
  const isTicketCreator = ticket && currentUserId ? ticket.id_user === currentUserId : false

  // Only the origin division's admin (or a super_admin) may approve/reject a pending ticket
  const canReviewApproval = ticket && ticket.approval_status === "pending" && (
    currentUserRole === "super_admin" ||
    (currentUserRole === "admin" && currentUserDivision === ticket.user_division)
  )

  const handleApprovalAction = async (action: "approve" | "reject") => {
    if (!ticket) return

    if (action === "reject" && !rejectReason.trim()) {
      alert("Mohon isi alasan penolakan")
      return
    }

    try {
      setApproving(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tickets/${ticket.id}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          action === "approve" ? { action } : { action, reason: rejectReason.trim() }
        ),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Gagal memproses persetujuan tiket")
        return
      }

      setShowRejectForm(false)
      setRejectReason("")
      fetchTicketDetails()
      fetchComments()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error("Error processing approval:", error)
      alert("Terjadi kesalahan saat memproses persetujuan tiket")
    } finally {
      setApproving(false)
    }
  }

  const fetchTicketDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      console.log("[TicketDetailModal] Fetched ticket data:", data.ticket)
      if (data.ticket) {
        setTicket(data.ticket)
        setNewStatus(data.ticket.status || "")
      }
    } catch (error) {
      console.error("Error fetching ticket:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleSubmitComment = async () => {
    // Double-check: prevent submit if ticket is closed (check both ticket status and comments)
    const isTicketClosed = ticket?.status === "closed" || comments.some(c => c.new_status === "closed")
    if (isTicketClosed) {
      alert("Tiket sudah ditutup dan tidak dapat menerima tanggapan lagi")
      fetchTicketDetails() // Refresh to update UI
      return
    }

    if (!newComment.trim() && !attachment) {
      alert("Mohon isi komentar atau upload bukti foto")
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")
      const formData = new FormData()

      formData.append("comment", newComment || "Mengirim bukti foto")

      // Determine comment type and status
      const oldStatus = ticket?.status || ""
      const commentType = newStatus !== oldStatus ? "status_change" : "response"

      formData.append("commentType", commentType)
      formData.append("oldStatus", oldStatus)
      formData.append("newStatus", newStatus)

      if (attachment) {
        formData.append("attachment", attachment)
      }

      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        setNewComment("")
        setAttachment(null)
        fetchTicketDetails()
        fetchComments()
        if (onUpdate) onUpdate()

        // Reset file input
        const fileInput = document.getElementById("comment-attachment") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        // Get error message from server
        const errorData = await response.json()
        alert(errorData.error || "Gagal mengirim komentar")
        // Refresh ticket details to get latest status
        fetchTicketDetails()
        fetchComments()
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      alert("Terjadi kesalahan saat mengirim komentar")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; label: string } } = {
      new: { color: "bg-blue-500", label: "Baru" },
      in_progress: { color: "bg-yellow-500", label: "Diproses" },
      resolved: { color: "bg-green-500", label: "Selesai" },
      closed: { color: "bg-gray-600", label: "Ditutup" }
    }
    const config = statusConfig[status?.toLowerCase()] || { color: "bg-blue-500", label: "Baru" }
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    )
  }

  const getApprovalBadge = (approvalStatus?: string) => {
    if (!approvalStatus || approvalStatus === "not_required") return null

    const config: { [key: string]: { color: string; label: string; icon: any } } = {
      pending: { color: "bg-amber-500", label: "Menunggu Persetujuan", icon: ShieldQuestion },
      approved: { color: "bg-emerald-600", label: "Disetujui", icon: ShieldCheck },
      rejected: { color: "bg-red-600", label: "Ditolak", icon: ShieldX },
    }
    const cfg = config[approvalStatus]
    if (!cfg) return null
    const Icon = cfg.icon

    return (
      <Badge className={`${cfg.color} text-white gap-1`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: string } = {
      user: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      super_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    }
    const roleLabels: { [key: string]: string } = {
      user: "User",
      admin: "Admin",
      super_admin: "Super Admin"
    }
    return (
      <Badge className={roleColors[role] || "bg-gray-100 text-gray-800"}>
        {roleLabels[role] || role}
      </Badge>
    )
  }

  if (!isOpen || !ticketId) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black dark:text-white">
            Detail Tiket {ticket ? formatTicketId(ticket.id, ticket.user_division, ticket.ticket_sequence) : `#${ticketId}`}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        ) : ticket ? (
          <div className="space-y-6">
            {/* Ticket Header */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                      {ticket.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getStatusBadge(ticket.status)}
                      {getApprovalBadge(ticket.approval_status)}
                      {ticket.urgency && !editingUrgency && (
                        <Badge className={URGENCY_META[ticket.urgency].color}>
                          {URGENCY_META[ticket.urgency].label}
                        </Badge>
                      )}
                      {/* Divisi Tujuan dari NLP */}
                      {(ticket.nlp_category || ticket.category) && (
                        <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 gap-1">
                          <Building2 className="w-3 h-3" />
                          {ticket.nlp_category || ticket.category}
                        </Badge>
                      )}
                      {canEditUrgency && !editingUrgency && (
                        <button
                          type="button"
                          onClick={() => {
                            setUrgencyDraft(ticket.urgency || "medium")
                            setEditingUrgency(true)
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Ubah urgensi
                        </button>
                      )}
                    </div>

                    {editingUrgency && (
                      <div className="flex items-center gap-2 mb-3">
                        <Select value={urgencyDraft} onValueChange={(v) => setUrgencyDraft(v as Urgency)}>
                          <SelectTrigger className="w-40 bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {URGENCY_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {URGENCY_META[level].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleSaveUrgency} disabled={savingUrgency}>
                          {savingUrgency ? "Menyimpan..." : "Simpan"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingUrgency(false)} disabled={savingUrgency}>
                          Batal
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{ticket.user_name} ({ticket.user_email})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(ticket.created_at), "dd MMM yyyy, HH:mm")}</span>
                  </div>
                  {(() => {
                    const deadlineInfo = getDeadlineInfo(ticket.deadline_at, ticket.status)
                    if (!deadlineInfo) return null
                    return (
                      <div className={`flex items-center gap-2 text-sm ${deadlineInfo.overdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-300"}`}>
                        <Clock className="w-4 h-4" />
                        <span>
                          Deadline: {format(new Date(ticket.deadline_at!), "dd MMM yyyy, HH:mm")} ({deadlineInfo.label})
                        </span>
                      </div>
                    )
                  })()}
                </div>

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Deskripsi:
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>

                {ticket.image_user_url && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Lampiran:
                    </p>
                    {brokenImages.has("ticket") ? (
                      <div className="flex items-center gap-2 max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-400 dark:text-gray-500">
                        <ImageOff className="w-5 h-5" />
                        Gambar tidak dapat dimuat
                      </div>
                    ) : (
                      <img
                        src={ticket.image_user_url}
                        alt="Ticket attachment"
                        className="max-w-md rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={() => markImageBroken("ticket")}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Riwayat & Tanggapan ({comments.length})
              </h4>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Belum ada tanggapan
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  comments.map((comment) => (
                    <Card
                      key={comment.id}
                      className="bg-white dark:bg-black border-gray-200 dark:border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                              {comment.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-black dark:text-white text-sm">
                                {comment.user_name}
                                {comment.user_division && (
                                  <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                                    ({comment.user_division})
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-2">
                                {getRoleBadge(comment.user_role)}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(new Date(comment.created_at), "dd MMM yyyy, HH:mm")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {comment.comment_type === "status_change" && (
                            <Badge className="bg-orange-500 text-white">
                              Status Changed
                            </Badge>
                          )}
                        </div>

                        {comment.comment_type === "status_change" && (
                          <div className="mb-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              Status diubah dari{" "}
                              <strong>{comment.old_status}</strong> ke{" "}
                              <strong>{comment.new_status}</strong>
                            </span>
                          </div>
                        )}

                        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                          {comment.comment}
                        </p>

                        {comment.attachment_path && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <ImageIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Bukti Foto:
                              </span>
                            </div>
                            {brokenImages.has(`comment-${comment.id}`) ? (
                              <div className="flex items-center gap-2 max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-400 dark:text-gray-500">
                                <ImageOff className="w-5 h-5" />
                                Gambar tidak dapat dimuat
                              </div>
                            ) : (
                              <img
                                src={comment.attachment_path}
                                alt="Comment attachment"
                                className="max-w-sm rounded-lg border border-gray-200 dark:border-gray-700"
                                onError={() => markImageBroken(`comment-${comment.id}`)}
                              />
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Approval Panel - shown while ticket is pending/rejected for cross-division routing */}
            {ticket.approval_status === "pending" && (
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <ShieldQuestion className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        Menunggu Persetujuan
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Tiket ini ditujukan ke divisi lain dan menunggu persetujuan admin divisi{" "}
                        <strong>{ticket.user_division}</strong> sebelum diteruskan ke divisi tujuan.
                      </p>

                      {canReviewApproval && (
                        <div className="mt-4 space-y-3">
                          {!showRejectForm ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprovalAction("approve")}
                                disabled={approving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {approving ? "Memproses..." : "Setujui Tiket"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowRejectForm(true)}
                                disabled={approving}
                                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                Tolak Tiket
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Tulis alasan penolakan..."
                                className="bg-white dark:bg-black border-gray-300 dark:border-gray-600"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleApprovalAction("reject")}
                                  disabled={approving}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {approving ? "Memproses..." : "Konfirmasi Tolak"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => { setShowRejectForm(false); setRejectReason("") }}
                                  disabled={approving}
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {ticket.approval_status === "rejected" && (
              <Card className="bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
                        Tiket Ditolak
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Tiket ini ditolak oleh admin divisi {ticket.user_division} dan tidak diteruskan.
                      </p>
                      {ticket.rejection_reason && (
                        <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                          <strong>Alasan:</strong> {ticket.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Comment Form - Disabled if ticket is closed, pending, or rejected */}
            {/* Check both ticket.status and comments history for closed status */}
            {ticket.approval_status !== "pending" && ticket.approval_status !== "rejected" && (
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                {(ticket.status === "closed" || comments.some(c => c.new_status === "closed")) ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Tiket Sudah Ditutup
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Tiket ini sudah ditutup dan tidak dapat menerima tanggapan lagi.
                    </p>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Tutup
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
                      Tambah Tanggapan
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                          Status Tiket
                        </label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-600">
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            {/* Only ticket creator can close the ticket */}
                            {isTicketCreator && (
                              <SelectItem value="closed">Closed</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                          Komentar / Tanggapan
                        </label>
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Tulis tanggapan Anda..."
                          className="min-h-24 bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-black dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                          Upload Bukti Foto (Opsional)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="comment-attachment"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-600 dark:text-gray-300
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200
                              hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                          />
                        </div>
                        {attachment && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            File terpilih: {attachment.name}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={onClose}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          Tutup
                        </Button>
                        <Button
                          onClick={handleSubmitComment}
                          disabled={submitting}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {submitting ? "Mengirim..." : "Kirim Tanggapan"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Ticket tidak ditemukan</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}