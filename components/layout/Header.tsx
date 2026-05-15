'use client'

import { Ambulance, LogOut, User, Moon, Sun } from 'lucide-react'
import { SyncStatus } from './SyncStatus'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { useDarkMode } from '@/hooks/useDarkMode'
import { ROLE_LABELS } from '@/lib/auth/roles'

export function Header() {
  const { user, role, signOut } = useUser()
  const { dark, toggle: toggleDark } = useDarkMode()

  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split('@')[0]
    ?? 'משתמש'

  return (
    <header
      className="h-14 bg-[#1F4E78] text-white flex items-center px-4 gap-4 shadow-md sticky top-0 z-50"
      role="banner"
    >
      <div className="flex items-center gap-2 flex-1">
        <Ambulance size={24} aria-hidden="true" />
        <span className="font-bold text-lg hidden sm:inline">דו&quot;ח אמבולנס PCR</span>
        <span className="font-bold text-lg sm:hidden">PCR</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-white/10 rounded-md px-2 py-1">
          <SyncStatus />
        </div>

        {user && (
          <div className="flex items-center gap-1.5 text-sm text-white/80">
            <User size={16} aria-hidden="true" />
            <span className="hidden md:inline">{displayName}</span>
            {role && (
              <span className="hidden lg:inline text-white/50 text-xs">
                ({ROLE_LABELS[role]})
              </span>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 min-h-11 min-w-11"
          aria-label={dark ? 'מצב בהיר' : 'מצב כהה'}
          onClick={toggleDark}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 min-h-11 min-w-11"
          aria-label="יציאה מהמערכת"
          onClick={signOut}
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  )
}
