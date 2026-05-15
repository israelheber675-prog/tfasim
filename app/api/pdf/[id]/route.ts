import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { CallPDFDocument } from '@/components/pdf/CallPDF'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function makeDoc(callId: string, data: Record<string, unknown>): ReactElement<DocumentProps> {
  return createElement(CallPDFDocument, { callId, data }) as unknown as ReactElement<DocumentProps>
}

function toResponse(buffer: Buffer, id: string) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="PCR-${id.slice(0, 8)}.pdf"`,
    },
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Call not found' }, { status: 404 })
  }

  const buffer = await renderToBuffer(makeDoc(id, data.data as Record<string, unknown>))
  return toResponse(buffer, id)
}

export async function POST(req: NextRequest) {
  const { callId, data } = await req.json() as { callId: string; data: Record<string, unknown> }
  const buffer = await renderToBuffer(makeDoc(callId, data))
  return toResponse(buffer, callId)
}
