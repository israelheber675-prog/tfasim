'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  helper?: string
  children: ReactNode
  className?: string
  htmlFor?: string
}

export function FormField({
  label,
  required,
  error,
  helper,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-700 flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-red-500 text-xs" aria-label="שדה חובה">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}

      {helper && !error && (
        <p className="text-xs text-gray-400">{helper}</p>
      )}
    </div>
  )
}
