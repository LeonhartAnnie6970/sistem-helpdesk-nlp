"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Send, User, Clock, MessageSquare, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"

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
  title: string
  description: string
  category: string
  status: string
  target_division: string
  created_at: string
  user_name: string
  user_email: string
  image_path?: string
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

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicketDetails()
      fetchComments()
    }
  }, [isOpen, ticketId])

  const fetchTicketDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setTicket(data.ticket)
      setNewStatus(data.ticket.status)
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
        alert("Gagal mengirim komentar")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      alert("Terjadi kesalahan saat mengirim komentar")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      new: "bg-blue-500",
      in_progress: "bg-yellow-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500"
    }
    return (
      <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
        {status.replace("_", " ").toUpperCase()}
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
            Detail Tiket #{ticketId}
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
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getStatusBadge(ticket.status)}
                      <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
                        {ticket.category}
                      </Badge>
                      <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
                        {ticket.target_division}
                      </Badge>
                    </div>
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
                </div>

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Deskripsi:
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>

                {ticket.image_path && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Lampiran:
                    </p>
                    <img
                      src={ticket.image_path}
                      alt="Ticket attachment"
                      className="max-w-md rounded-lg border border-gray-200 dark:border-gray-700"
                    />
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
                            <img
                              src={comment.attachment_path}
                              alt="Comment attachment"
                              className="max-w-sm rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Add Comment Form */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
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
                        <SelectItem value="closed">Closed</SelectItem>
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
              </CardContent>
            </Card>
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
