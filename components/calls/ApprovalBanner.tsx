'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, ShieldCheck, Loader2 } from 'lucide-react'
import { db, auditLog } from '@/lib/offline/db'
import { useUser } from '@/hooks/useUser'
import { hasMinRole } from '@/lib/auth/roles'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

interface ApprovalData {
  status: ApprovalStatus
  reviewedBy?: string
  reviewedAt?: number
  reviewNote?: string
}

interface Props {
  callId: string
  approval: ApprovalData
  onUpdate: (a: ApprovalData) => void
}

const STATUS_CONFIG = {
  pending:  { label: 'ממתין לאישור מפקח',  icon: Clock,        bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700' },
  approved: { label: 'אושר על ידי מפקח',   icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  rejected: { label: 'הוחזר לתיקון',        icon: XCircle,      bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700' },
}

export function ApprovalBanner({ callId, approval, onUpdate }: Props) {
  const { role, user } = useUser()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNote, setShowNote] = useState(false)

  const isSupervisor = role ? hasMinRole(role, 'supervisor') : false
  const cfg = STATUS_CONFIG[approval.status]
  const Icon = cfg.icon

  async function act(status: 'approved' | 'rejected') {
    if (!user) return
    setLoading(true)
    const updated: ApprovalData = {
      status,
      reviewedBy: user.email ?? user.id,
      reviewedAt: Date.now(),
      reviewNote: note.trim() || undefined,
    }
    const call = await db.calls.get(callId)
    if (call) {
      await db.calls.put({ ...call, data: { ...call.data, approval: updated }, updatedAt: Date.now() })
      auditLog(status === 'approved' ? 'call_submitted' : 'call_updated', callId, `status=${status}`)
    }
    onUpdate(updated)
    setLoading(false)
    setShowNote(false)
    setNote('')
  }

  return (
    <div className={`rounded-xl border ${cfg.bg} ${cfg.border} p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm font-semibold ${cfg.text}`}>
          <Icon size={16} />
          {cfg.label}
          {approval.reviewedBy && (
            <span className="font-normal text-xs opacity-70">
              — {approval.reviewedBy}
              {approval.reviewedAt && ` · ${new Date(approval.reviewedAt).toLocaleString('he-IL')}`}
            </span>
          )}
        </div>

        {isSupervisor && approval.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNote(s => !s)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
            >
              <ShieldCheck size={13} />
              בדוק
            </button>
          </div>
        )}

        {isSupervisor && approval.status !== 'pending' && (
          <button
            type="button"
            onClick={() => {
              const reset: ApprovalData = { status: 'pending' }
              db.calls.get(callId).then(c => {
                if (c) db.calls.put({ ...c, data: { ...c.data, approval: reset }, updatedAt: Date.now() })
              })
              onUpdate(reset)
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            אפס
          </button>
        )}
      </div>

      {approval.reviewNote && (
        <p className={`text-xs ${cfg.text} opacity-80 bg-white/60 rounded-md px-3 py-2 border ${cfg.border}`}>
          {approval.reviewNote}
        </p>
      )}

      {isSupervisor && showNote && approval.status === 'pending' && (
        <div className="space-y-2 pt-2 border-t border-amber-200">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="הערה (אופציונלי)"
            rows={2}
            className="w-full text-sm rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F4E78] resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => act('approved')}
              disabled={loading}
              className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              אשר
            </button>
            <button
              type="button"
              onClick={() => act('rejected')}
              disabled={loading}
              className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              החזר לתיקון
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
