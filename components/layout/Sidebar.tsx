'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, PlusCircle, LayoutDashboard, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/calls', icon: Phone, label: 'קריאות' },
  { href: '/new-call', icon: PlusCircle, label: 'קריאה חדשה' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'דשבורד' },
  { href: '/reports', icon: FileText, label: 'דוחות' },
  { href: '/settings', icon: Settings, label: 'הגדרות' },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar — מופיע מימין ב-RTL */}
      <aside
        className="hidden md:flex flex-col w-56 bg-[#1F4E78] text-white min-h-screen pt-4"
        role="navigation"
        aria-label="ניווט ראשי"
      >
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-2 pb-4">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors min-h-[44px]"
          >
            <Settings size={20} aria-hidden="true" />
            הגדרות
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-[#1F4E78] text-white flex z-50 safe-area-pb"
        role="navigation"
        aria-label="ניווט תחתון"
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs min-h-[56px] transition-colors',
                isActive ? 'text-white' : 'text-white/60'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
