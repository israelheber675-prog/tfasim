'use client'

import { Clock } from 'lucide-react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TimeFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onNow?: () => void
  error?: boolean
}

export const TimeField = forwardRef<HTMLInputElement, TimeFieldProps>(
  ({ className, onNow, error, ...props }, ref) => {
    function handleNow() {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const timeValue = `${hh}:${mm}`

      // fire onChange with a synthetic event
      const nativeInput = document.getElementById(props.id ?? '') as HTMLInputElement
      if (nativeInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        )?.set
        nativeInputValueSetter?.call(nativeInput, timeValue)
        nativeInput.dispatchEvent(new Event('input', { bubbles: true }))
        nativeInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
      onNow?.()
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type="time"
          ref={ref}
          className={cn(
            'flex h-11 rounded-md border border-input bg-background px-3 py-2 text-base',
            'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'w-[120px] text-center',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={handleNow}
          className="flex items-center gap-1 px-3 h-11 rounded-md bg-[#DDEBF7] text-[#1F4E78] text-sm font-medium hover:bg-[#c5d9f0] transition-colors min-w-[44px] border border-[#2E75B6]/30"
          aria-label="הגדר לשעה הנוכחית"
        >
          <Clock size={15} aria-hidden="true" />
          <span className="hidden sm:inline">עכשיו</span>
        </button>
      </div>
    )
  }
)
TimeField.displayName = 'TimeField'
