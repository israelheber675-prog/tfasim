// Lightweight toast system — no external dependency
type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  duration?: number
}

function show(message: string, type: ToastType, options: ToastOptions = {}) {
  if (typeof window === 'undefined') return
  const { duration = 3500 } = options

  const el = document.createElement('div')
  el.setAttribute('role', 'alert')
  el.setAttribute('aria-live', 'polite')

  const colors = {
    success: 'bg-emerald-600 text-white',
    error:   'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info:    'bg-[#1F4E78] text-white',
  }
  const icons = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  }

  el.className = [
    'fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999]',
    'flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-sm font-medium',
    'animate-in slide-in-from-bottom-4 fade-in duration-200',
    colors[type],
  ].join(' ')

  el.style.minWidth = '260px'
  el.style.maxWidth = '90vw'
  el.style.textAlign = 'center'
  el.style.justifyContent = 'center'
  el.textContent = `${icons[type]} ${message}`

  document.body.appendChild(el)

  setTimeout(() => {
    el.style.transition = 'opacity 0.3s, transform 0.3s'
    el.style.opacity = '0'
    el.style.transform = 'translateX(-50%) translateY(8px)'
    setTimeout(() => el.remove(), 350)
  }, duration)
}

export const toast = {
  success: (msg: string, opts?: ToastOptions) => show(msg, 'success', opts),
  error:   (msg: string, opts?: ToastOptions) => show(msg, 'error',   opts),
  warning: (msg: string, opts?: ToastOptions) => show(msg, 'warning', opts),
  info:    (msg: string, opts?: ToastOptions) => show(msg, 'info',    opts),
}
