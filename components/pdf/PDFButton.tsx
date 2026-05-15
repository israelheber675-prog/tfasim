'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { db, auditLog } from '@/lib/offline/db'

interface Props {
  callId: string
  variant?: 'button' | 'icon'
  className?: string
}

export function PDFButton({ callId, variant = 'button', className = '' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)

    try {
      let blob: Blob

      // Try server-side API first (synced calls)
      if (navigator.onLine) {
        const res = await fetch(`/api/pdf/${callId}`)
        if (res.ok) {
          blob = await res.blob()
        } else {
          // Fallback: use local IndexedDB data
          blob = await generateClientSide(callId)
        }
      } else {
        // Offline: generate from local data
        blob = await generateClientSide(callId)
      }

      // Download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PCR-${callId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      auditLog('pdf_downloaded', callId)
    } catch (e) {
      setError('שגיאה ביצירת PDF')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function generateClientSide(id: string): Promise<Blob> {
    // Get data from IndexedDB
    const call = await db.calls.get(id)
    if (!call) throw new Error('Call not found in local DB')

    // Dynamic import to avoid SSR issues
    const [reactPdf, { CallPDFDocument }, React] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./CallPDF'),
      import('react'),
    ])

    const doc = React.createElement(
      CallPDFDocument,
      { callId: id, data: call.data }
    ) as unknown as Parameters<typeof reactPdf.pdf>[0]

    return await reactPdf.pdf(doc).toBlob()
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        title="הורד PDF"
        className={`h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors ${className}`}
      >
        {loading
          ? <Loader2 size={16} className="animate-spin text-[#1F4E78]" />
          : <FileDown size={16} className="text-[#1F4E78]" />
        }
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className={`flex items-center gap-2 h-10 px-4 rounded-md border border-[#2E75B6] text-[#1F4E78] text-sm font-medium hover:bg-[#DDEBF7] disabled:opacity-50 transition-colors ${className}`}
      >
        {loading
          ? <Loader2 size={15} className="animate-spin" />
          : <FileDown size={15} />
        }
        {loading ? 'מייצר PDF...' : 'הורד PDF'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
