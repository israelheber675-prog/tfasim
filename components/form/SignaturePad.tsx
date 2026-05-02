'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { RotateCcw, Check } from 'lucide-react'

interface Props {
  label: string
  value?: string          // base64 PNG
  onChange: (v: string) => void
  className?: string
}

export function SignaturePad({ label, value, onChange, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSig, setHasSig] = useState(!!value)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Load existing sig
  useEffect(() => {
    if (!value || !canvasRef.current) return
    const img = new Image()
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.drawImage(img, 0, 0)
      }
    }
    img.src = value
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e)
    lastPos.current = pos
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = '#1F4E78'
      ctx.fill()
    }
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!isDrawing || !lastPos.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1F4E78'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
    setHasSig(true)
  }

  function stopDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)
    lastPos.current = null
    // Save
    const data = canvasRef.current?.toDataURL('image/png') ?? ''
    onChange(data)
  }

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSig(false)
    onChange('')
  }, [onChange])

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative rounded-md border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden"
        style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full h-40 cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasSig && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm select-none">
            חתום כאן
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={clear}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors">
          <RotateCcw size={13} /> נקה חתימה
        </button>
        {hasSig && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check size={13} /> נחתם
          </span>
        )}
      </div>
    </div>
  )
}
