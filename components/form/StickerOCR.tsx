'use client'

import { useRef, useState } from 'react'
import { Camera, X, Loader2, ScanLine } from 'lucide-react'

interface ExtractedData {
  patientId?: string
  patientFirstName?: string
  patientLastName?: string
  patientDob?: string
}

interface Props {
  onExtracted: (data: ExtractedData) => void
}

function parseHebrewSticker(text: string): ExtractedData {
  const result: ExtractedData = {}
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    // ID: 9-digit sequence
    const idMatch = line.match(/\b(\d{7,9})\b/)
    if (idMatch && !result.patientId) result.patientId = idMatch[1]

    // DOB: DD/MM/YYYY or DD-MM-YYYY
    const dobMatch = line.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/)
    if (dobMatch && !result.patientDob) {
      const [, d, m, y] = dobMatch
      result.patientDob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }

    // Hebrew name heuristic: line with ≥2 Hebrew words, no digits
    if (!result.patientFirstName && /[א-ת]{2,}/.test(line) && !/\d/.test(line)) {
      const words = line.match(/[א-ת]+/g) ?? []
      if (words.length >= 2) {
        result.patientFirstName = words[0]
        result.patientLastName = words.slice(1).join(' ')
      }
    }
  }

  return result
}

export function StickerOCR({ onExtracted }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImage(file: File) {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setStatus('processing')
    setExtracted(null)

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('heb+eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      const parsed = parseHebrewSticker(text)
      setExtracted(parsed)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImage(file)
  }

  function applyAndClose() {
    if (extracted) onExtracted(extracted)
    setOpen(false)
    setStatus('idle')
    setPreview(null)
    setExtracted(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-[#2E75B6]/40 text-[#1F4E78] hover:bg-blue-50 transition-colors"
      >
        <ScanLine size={15} />
        סרוק מדבקת בית חולים
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { if (status !== 'processing') setOpen(false) }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2 font-semibold text-[#1F4E78]">
                <ScanLine size={18} />
                OCR מדבקת בית חולים
              </div>
              {status !== 'processing' && (
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Camera / file input */}
              {status === 'idle' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    צלם או העלה תמונה של מדבקת המטופל מבית החולים.
                    המערכת תנסה לחלץ ת.ז., שם ותאריך לידה אוטומטית.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (fileRef.current) {
                          fileRef.current.accept = 'image/*'
                          fileRef.current.capture = 'environment'
                          fileRef.current.click()
                        }
                      }}
                      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 border-dashed border-[#2E75B6]/40 hover:border-[#2E75B6] hover:bg-blue-50 transition-colors text-[#1F4E78]"
                    >
                      <Camera size={28} />
                      <span className="text-sm font-medium">צלם</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (fileRef.current) {
                          fileRef.current.removeAttribute('capture')
                          fileRef.current.accept = 'image/*'
                          fileRef.current.click()
                        }
                      }}
                      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-500"
                    >
                      <ScanLine size={28} />
                      <span className="text-sm font-medium">בחר תמונה</span>
                    </button>
                  </div>
                  <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
                </div>
              )}

              {/* Preview */}
              {preview && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="תצוגה מקדימה" className="w-full max-h-40 object-contain bg-gray-50" />
                </div>
              )}

              {/* Processing */}
              {status === 'processing' && (
                <div className="flex flex-col items-center gap-3 py-4 text-[#1F4E78]">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="text-sm font-medium">מעבד תמונה...</p>
                  <p className="text-xs text-gray-400">זה עלול לקחת מספר שניות</p>
                </div>
              )}

              {/* Results */}
              {status === 'done' && extracted && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">פרטים שזוהו:</p>
                  <div className="rounded-lg bg-gray-50 divide-y divide-gray-200 text-sm">
                    {extracted.patientId && (
                      <div className="flex justify-between px-3 py-2">
                        <span className="text-gray-500">ת.ז.</span>
                        <span className="font-mono font-medium">{extracted.patientId}</span>
                      </div>
                    )}
                    {extracted.patientFirstName && (
                      <div className="flex justify-between px-3 py-2">
                        <span className="text-gray-500">שם פרטי</span>
                        <span className="font-medium">{extracted.patientFirstName}</span>
                      </div>
                    )}
                    {extracted.patientLastName && (
                      <div className="flex justify-between px-3 py-2">
                        <span className="text-gray-500">שם משפחה</span>
                        <span className="font-medium">{extracted.patientLastName}</span>
                      </div>
                    )}
                    {extracted.patientDob && (
                      <div className="flex justify-between px-3 py-2">
                        <span className="text-gray-500">תאריך לידה</span>
                        <span className="font-mono font-medium">{extracted.patientDob}</span>
                      </div>
                    )}
                    {!extracted.patientId && !extracted.patientFirstName && (
                      <div className="px-3 py-3 text-center text-gray-400">לא זוהו פרטים — נסה תמונה ברורה יותר</div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={applyAndClose}
                      disabled={!extracted.patientId && !extracted.patientFirstName}
                      className="flex-1 py-2 rounded-lg bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] disabled:opacity-40 transition-colors"
                    >
                      מלא פרטים בטופס
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStatus('idle'); setPreview(null); setExtracted(null) }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      נסה שוב
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="space-y-3 text-center">
                  <p className="text-sm text-red-600">שגיאה בעיבוד התמונה. נסה שוב.</p>
                  <button
                    type="button"
                    onClick={() => { setStatus('idle'); setPreview(null) }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    נסה שוב
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
