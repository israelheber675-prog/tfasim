import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'דו"ח אמבולנס PCR',
  description: 'טופס דיגיטלי לדיווח קריאת אמבולנס',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'דו"ח אמבולנס',
  },
}

export const viewport: Viewport = {
  themeColor: '#1F4E78',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}
