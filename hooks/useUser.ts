'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/auth/roles'
import { can, type Permission } from '@/lib/auth/roles'

interface UserProfile {
  user: User | null
  role: UserRole | undefined
  loading: boolean
  can: (p: Permission) => boolean
  signOut: () => Promise<void>
}

export function useUser(): UserProfile {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      // Role stored in user_metadata (set by admin) or app_metadata
      const r = (user?.user_metadata?.role ?? user?.app_metadata?.role) as UserRole | undefined
      setRole(r)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      setUser(u)
      const r = (u?.user_metadata?.role ?? u?.app_metadata?.role) as UserRole | undefined
      setRole(r)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return {
    user,
    role,
    loading,
    can: (p: Permission) => can(role, p),
    signOut,
  }
}
