import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/auth/roles'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function assertAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const role = user.user_metadata?.role ?? user.app_metadata?.role
  if (role !== 'admin') return null
  return user
}

// GET /api/admin/users — list all users
export async function GET() {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const admin = getAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (error) throw error
    return NextResponse.json({ users: data.users })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// PATCH /api/admin/users — update role
export async function PATCH(req: Request) {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId, role } = await req.json() as { userId: string; role: UserRole }
  if (!userId || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try {
    const admin = getAdminClient()
    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
