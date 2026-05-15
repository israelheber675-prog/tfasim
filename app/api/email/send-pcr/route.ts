import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import React from 'react'
import path from 'path'
import { Font } from '@react-pdf/renderer'

// ── Email config from env ─────────────────────────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '587')
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM ?? 'PCR System <noreply@ambulance.local>'

function isEmailConfigured() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)
}

// ── PDF generation ────────────────────────────────────────────────────────────
async function generatePDF(callId: string, data: Record<string, unknown>): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Heebo.ttf')
  try {
    Font.register({ family: 'Heebo', src: fontPath })
  } catch { /* already registered */ }

  const [reactPdf, { CallPDFDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/pdf/CallPDF'),
  ])

  const doc = React.createElement(
    CallPDFDocument,
    { callId, data }
  ) as unknown as Parameters<typeof reactPdf.pdf>[0]

  const uint8 = await reactPdf.pdf(doc).toBuffer()
  return Buffer.from(uint8 as unknown as ArrayBuffer)
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { callId, data, recipientEmail, patientName } = await req.json() as {
      callId: string
      data: Record<string, unknown>
      recipientEmail: string
      patientName?: string
    }

    if (!recipientEmail || !callId) {
      return NextResponse.json({ error: 'חסרים פרמטרים' }, { status: 400 })
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return NextResponse.json({ error: 'כתובת מייל לא תקינה' }, { status: 400 })
    }

    // Check if email is configured
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'שירות המייל אינו מוגדר. הוסף SMTP_HOST, SMTP_USER, SMTP_PASS לקובץ .env.local' },
        { status: 503 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(callId, data)

    // Send email
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    const formNum = (data.formNumber as string) || callId.slice(0, 8).toUpperCase()
    const name = patientName || 'מטופל'
    const date = (data.callDate as string) || new Date().toLocaleDateString('he-IL')

    await transporter.sendMail({
      from: SMTP_FROM,
      to: recipientEmail,
      subject: `עותק טופס טיפול רפואי (PCR) — ${name} — ${date}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1F4E78; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">טופס טיפול רפואי — PCR</h2>
            <p style="margin: 5px 0 0; opacity: 0.8;">מספר טופס: #${formNum}</p>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>שלום ${name},</p>
            <p>מצורף עותק של טופס הטיפול הרפואי שלך מתאריך ${date}.</p>
            <p style="color: #6b7280; font-size: 14px;">
              מסמך זה מכיל מידע רפואי רגיש. אנא שמור אותו במקום מאובטח.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">
              נשלח אוטומטית ממערכת PCR אמבולנס
            </p>
          </div>
        </div>
      `,
      attachments: [{
        filename: `PCR-${formNum}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    })

    return NextResponse.json({ success: true, message: `PDF נשלח בהצלחה ל-${recipientEmail}` })

  } catch (err) {
    console.error('[email/send-pcr]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'שגיאה בשליחת המייל' },
      { status: 500 }
    )
  }
}
