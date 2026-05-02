import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// שימוש ב-service role כי זה server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { callId, operation, payload } = await req.json()

    if (!callId || !operation) {
      return NextResponse.json({ error: 'Missing callId or operation' }, { status: 400 })
    }

    if (operation === 'upsert') {
      const { error } = await supabase
        .from('calls')
        .upsert({
          id: callId,
          data: payload,
          updated_at: new Date().toISOString(),
          synced: true,
        }, { onConflict: 'id' })

      if (error) {
        console.error('Supabase upsert error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    if (operation === 'delete') {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', callId)

      if (error) {
        console.error('Supabase delete error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Sync route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// בדיקת חיבור — GET /api/sync
export async function GET() {
  try {
    const { error } = await supabase.from('calls').select('id').limit(1)
    if (error) {
      return NextResponse.json({
        connected: false,
        error: error.message,
        hint: 'האם הרצת את ה-SQL ליצירת הטבלאות?'
      }, { status: 500 })
    }
    return NextResponse.json({ connected: true })
  } catch (err) {
    return NextResponse.json({
      connected: false,
      error: String(err)
    }, { status: 500 })
  }
}
