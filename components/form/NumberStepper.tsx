'use client'

import { Minus, Plus } from 'lucide-react'
import { forwardRef, useCallback } from 'react'
import { getVitalLevel, VITAL_LEVEL_COLORS, type VitalKey } from '@/lib/constants/vital-ranges'
import { cn } from '@/lib/utils'

interface NumberStepperProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  min?: number
  max?: number
  step?: number
  defaultValue?: number   // ערך התחלתי בלחיצה ראשונה על +
  unit?: string
  vitalKey?: VitalKey
  placeholder?: string
  disabled?: boolean
  id?: string
  'aria-label'?: string
}

export const NumberStepper = forwardRef<HTMLInputElement, NumberStepperProps>(
  ({ value, onChange, min = 0, max = 999, step = 1, defaultValue, unit, vitalKey, placeholder, disabled, id, 'aria-label': ariaLabel }, ref) => {
    const level = vitalKey && value !== undefined ? getVitalLevel(vitalKey, value) : 'unknown'
    const colorClass = VITAL_LEVEL_COLORS[level]

    // בלחיצה ראשונה: השתמש ב-defaultValue אם הוגדר, אחרת min
    const startValue = defaultValue ?? min

    const decrement = useCallback(() => {
      const curr = value ?? startValue
      const next = curr - step
      if (next >= min) onChange(next)
    }, [value, min, step, startValue, onChange])

    const increment = useCallback(() => {
      const curr = value ?? (startValue - step)  // -step כי נוסיף step מיד
      const next = curr + step
      if (next <= max) onChange(next)
    }, [value, max, step, startValue, onChange])

    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || (value !== undefined && value <= min)}
          className="h-11 w-11 flex items-center justify-center rounded-md border border-input bg-background hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="הפחת"
        >
          <Minus size={16} />
        </button>

        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="number"
            inputMode="numeric"
            value={value ?? ''}
            onChange={(e) => {
              const raw = e.target.value
              if (raw === '') { onChange(undefined); return }
              const v = Number(raw)
              if (isNaN(v)) return
              // אפשר הקלדה זמנית מחוץ לטווח — נחסום ב-blur
              onChange(v)
            }}
            onBlur={(e) => {
              const raw = e.target.value
              if (raw === '') return
              const v = Number(raw)
              if (isNaN(v)) return
              // כפה גבולות
              if (v < min) onChange(min)
              else if (v > max) onChange(max)
            }}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder ?? (defaultValue ? String(defaultValue) : String(min))}
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
              'h-11 w-20 text-center rounded-md border text-base font-medium',
              'focus:outline-none focus:ring-2 focus:ring-[#1F4E78] focus:ring-offset-1',
              'disabled:opacity-50',
              vitalKey && value !== undefined ? colorClass : 'border-input bg-background'
            )}
          />
          {unit && (
            <span className="absolute -bottom-4 inset-x-0 text-center text-xs text-gray-400">
              {unit}
            </span>
          )}
          {/* אזהרה על ערך מחוץ לטווח */}
          {vitalKey && value !== undefined && (level === 'danger') && (
            <span className="absolute -top-5 inset-x-0 text-center text-xs text-red-600 font-medium whitespace-nowrap">
              ⚠ ערך קיצוני
            </span>
          )}
          {vitalKey && value !== undefined && (level === 'warning') && (
            <span className="absolute -top-5 inset-x-0 text-center text-xs text-amber-600 whitespace-nowrap">
              ↑ מחוץ לנורמה
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={disabled || (value !== undefined && value >= max)}
          className="h-11 w-11 flex items-center justify-center rounded-md border border-input bg-background hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="הוסף"
        >
          <Plus size={16} />
        </button>
      </div>
    )
  }
)
NumberStepper.displayName = 'NumberStepper'
