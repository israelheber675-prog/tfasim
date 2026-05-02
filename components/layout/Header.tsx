'use client'

import { Ambulance, LogOut, User } from 'lucide-react'
import { SyncStatus } from './SyncStatus'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  userName?: string
}

export function Header({ userName }: HeaderProps) {
  return (
    <header
      className="h-14 bg-[#1F4E78] text-white flex items-center px-4 gap-4 shadow-md sticky top-0 z-50"
      role="banner"
    >
      <div className="flex items-center gap-2 flex-1">
        <Ambulance size={24} aria-hidden="true" />
        <span className="font-bold text-lg hidden sm:inline">דו"ח אמבולנס PCR</span>
        <span className="font-bold text-lg sm:hidden">PCR</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-white/10 rounded-md px-2 py-1">
          <SyncStatus />
        </div>

        {userName && (
          <div
            className="flex items-center gap-1.5 text-sm text-white/80"
            aria-label={`מחובר כ: ${userName}`}
          >
            <User size={16} aria-hidden="true" />
            <span className="hidden md:inline">{userName}</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 min-h-11 min-w-11"
          aria-label="יציאה מהמערכת"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  )
}
