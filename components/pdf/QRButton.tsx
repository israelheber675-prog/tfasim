'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, X } from 'lucide-react'

interface Props {
  callId: string
  patientName?: string
}

export function QRButton({ callId, patientName }: Props) {
  const [open, setOpen] = useState(false)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/calls/${callId}`
    : `/calls/${callId}`

  const label = patientName ? `PCR — ${patientName}` : `PCR #${callId.slice(0, 8)}`

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="QR Code לאסמכתא"
        className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors text-gray-500"
      >
        <QrCode size={16} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="border-4 border-white rounded-xl shadow-inner p-2 bg-white">
              <QRCodeSVG
                value={url}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">סרוק לצפייה בקריאה</p>
              <p className="text-xs font-mono text-gray-400 break-all">{callId.slice(0, 8).toUpperCase()}</p>
            </div>

            <button
              onClick={() => {
                const svg = document.querySelector('.qr-modal svg') as SVGElement
                if (!svg) return
                const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = `qr-${callId.slice(0, 8)}.svg`
                a.click()
              }}
              className="text-xs text-[#2E75B6] hover:underline"
            >
              הורד SVG
            </button>
          </div>
        </div>
      )}
    </>
  )
}
