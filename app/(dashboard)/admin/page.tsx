'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { ROLE_LABELS, type UserRole } from '@/lib/auth/roles'
import { ShieldAlert, Users, Loader2, CheckCircle2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const ROLES: UserRole[] = ['admin', 'supervisor', 'paramedic', 'emt']

interface UserRow {
  id: string
  email: string
  full_name: string
  role: UserRole | undefined
  last_sign_in: string | null
  saving?: boolean
  saved?: boolean
}

export default function AdminPage() {
  const { role, loading: authLoading } = useUser()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (role !== 'admin') { setLoading(false); return }

    fetch('/api/admin/users')
      .then(r => r.json())
      .then((data: { users?: User[]; error?: string }) => {
        if (data.error) { setError(data.error); return }
        setUsers((data.users ?? []).map(u => ({
          id: u.id,
          email: u.email ?? '',
          full_name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? '',
          role: u.user_metadata?.role as UserRole | undefined,
          last_sign_in: u.last_sign_in_at ?? null,
        })))
      })
      .catch(() => setError('שגיאה בטעינת משתמשים'))
      .finally(() => setLoading(false))
  }, [role, authLoading])

  async function updateRole(userId: string, newRole: UserRole) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, saving: true, saved: false } : u))
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    })
    const ok = res.ok
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, role: ok ? newRole : u.role, saving: false, saved: ok } : u
    ))
    if (ok) setTimeout(() => setUsers(prev => prev.map(u => u.id === userId ? { ...u, saved: false } : u)), 2000)
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
  }

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <ShieldAlert size={48} className="text-red-400" />
        <p className="text-lg font-semibold text-gray-700">אין הרשאה</p>
        <p className="text-sm text-gray-500">דף זה זמין למנהלי מערכת בלבד</p>
      </div>
    )
  }

  const s = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E78]'

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users size={24} className="text-[#1F4E78]" />
        <h1 className="text-2xl font-bold text-[#1F4E78]">ניהול משתמשים</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-right font-medium">משתמש</th>
              <th className="px-4 py-3 text-right font-medium">אימייל</th>
              <th className="px-4 py-3 text-right font-medium">כניסה אחרונה</th>
              <th className="px-4 py-3 text-right font-medium">תפקיד</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">אין משתמשים</td></tr>
            )}
            {users.map((u, i) => (
              <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-medium text-gray-800">{u.full_name || '—'}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{u.email}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {u.last_sign_in
                    ? new Date(u.last_sign_in).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : 'מעולם לא'}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role ?? ''}
                    disabled={u.saving}
                    onChange={e => updateRole(u.id, e.target.value as UserRole)}
                    className={s}
                  >
                    <option value="">ללא תפקיד</option>
                    {ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {u.saving && <Loader2 size={16} className="animate-spin text-gray-400" />}
                  {u.saved && <CheckCircle2 size={16} className="text-emerald-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">הרשאות לפי תפקיד:</p>
        <ul className="space-y-0.5 text-blue-600">
          <li>🔴 <strong>מנהל מערכת</strong> — גישה מלאה, ניהול משתמשים, יומן פעולות</li>
          <li>🟠 <strong>מפקח</strong> — צפייה בכל הקריאות, ייצוא נתונים, דשבורד</li>
          <li>🟡 <strong>פרמדיק</strong> — יצירה ועריכת קריאות, הורדת PDF</li>
          <li>🟢 <strong>חובש</strong> — יצירת קריאות, צפייה ברשימה</li>
        </ul>
      </div>
    </div>
  )
}
