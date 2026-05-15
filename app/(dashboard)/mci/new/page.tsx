'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMCIStore } from '@/stores/mciStore'
import { MCIEditor } from '@/components/mci/MCIEditor'

export default function NewMCIPage() {
  const { initNewIncident, incident } = useMCIStore()
  const router = useRouter()

  useEffect(() => {
    initNewIncident()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!incident) return null

  return (
    <MCIEditor
      onSaved={(id) => router.replace(`/mci/${id}`)}
    />
  )
}
