'use client'

import { useEffect, useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Already installed or dismissed this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    if (ios) {
      // On iOS, show install guide (no beforeinstallprompt event)
      const safari = /safari/i.test(navigator.userAgent)
      if (safari) setIsIOS(true)
      return
    }

    function onPrompt(e: Event) {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  function dismiss() {
    sessionStorage.setItem('pwa-banner-dismissed', '1')
    setDismissed(true)
    setPrompt(null)
    setIsIOS(false)
  }

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') dismiss()
    else setPrompt(null)
  }

  if (dismissed || (!prompt && !isIOS)) return null

  return (
    <>
      <div className="fixed bottom-20 md:bottom-4 inset-x-4 z-40 max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-[#2E75B6]/20 p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-[#DDEBF7] rounded-xl flex items-center justify-center shrink-0">
            <Smartphone size={20} className="text-[#1F4E78]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm">התקן את האפליקציה</p>
            <p className="text-xs text-gray-500 mt-0.5">גישה מהירה מהמסך הראשי, ללא דפדפן</p>

            {isIOS ? (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="mt-2 text-xs text-[#2E75B6] underline"
              >
                איך מתקינים ב-iPhone/iPad?
              </button>
            ) : (
              <button
                onClick={install}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium bg-[#1F4E78] text-white px-3 py-1.5 rounded-lg hover:bg-[#2E75B6] transition-colors"
              >
                <Download size={12} />
                התקן עכשיו
              </button>
            )}
          </div>

          <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS install guide modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4" onClick={() => setShowIOSGuide(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#1F4E78]">התקנה ב-iPhone / iPad</p>
              <button onClick={() => setShowIOSGuide(false)} className="text-gray-400">
                <X size={18} />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1F4E78] shrink-0">1.</span>
                לחץ על כפתור השיתוף <span className="font-mono bg-gray-100 px-1 rounded">⬆️</span> בשורת הכלים של Safari
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1F4E78] shrink-0">2.</span>
                גלול למטה ובחר <strong>הוסף למסך הבית</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1F4E78] shrink-0">3.</span>
                לחץ <strong>הוסף</strong> בפינה הימנית העליונה
              </li>
            </ol>
            <button
              onClick={() => { setShowIOSGuide(false); dismiss() }}
              className="w-full py-3 rounded-xl bg-[#1F4E78] text-white text-sm font-medium"
            >
              הבנתי
            </button>
          </div>
        </div>
      )}
    </>
  )
}
