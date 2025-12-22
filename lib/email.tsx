import nodemailer from "nodemailer"

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
})

export async function sendNotificationEmail(
  recipientEmail: string,
  adminName: string,
  ticketTitle: string,
  userName: string,
  userDivision: string,
  ticketId: number
) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: recipientEmail,
      subject: `[HELPDESK] Tiket Baru: ${ticketTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Tiket Baru Masuk</h2>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
            <p>Halo <strong>${adminName}</strong>,</p>
            <p>Ada tiket baru yang masuk di sistem Helpdesk NLP SJPL.</p>
            
            <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <p><strong>Judul Tiket:</strong> ${ticketTitle}</p>
              <p><strong>Dari:</strong> ${userName}</p>
              <p><strong>Divisi:</strong> ${userDivision}</p>
              <p><strong>ID Tiket:</strong> #${ticketId}</p>
            </div>
            
            <p>Silakan login ke dashboard admin untuk melihat detail tiket dan meresponnya.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/dashboard" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              Lihat di Dashboard
            </a>
          </div>
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 0 0 5px 5px; font-size: 12px; color: #666;">
            <p style="margin: 0;">© 2025 Helpdesk NLP SJPL. Pesan ini adalah notifikasi otomatis, jangan dibalas.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("[v0] Email sent successfully to:", recipientEmail)
    return true
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return false
  }
}
