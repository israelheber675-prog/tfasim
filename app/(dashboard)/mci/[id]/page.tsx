'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { db } from '@/lib/offline/db'
import { useMCIStore } from '@/stores/mciStore'
import { MCIEditor } from '@/components/mci/MCIEditor'

export default function MCIDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { loadIncident } = useMCIStore()
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    db.mciIncidents.get(id).then((inc) => {
      if (!inc) { setNotFound(true); setLoading(false); return }
      loadIncident(inc)
      setLoading(false)
    })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-[#1F4E78]" size={32} />
    </div>
  )
  if (notFound) return (
    <div className="text-center py-16 text-gray-400">האירוע לא נמצא</div>
  )

  return <MCIEditor onSaved={() => {}} />
}
