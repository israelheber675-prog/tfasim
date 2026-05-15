'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, PlusCircle, LayoutDashboard, FileText, Settings, AlertTriangle, ShieldCheck, Users, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'

const NAV_ITEMS = [
  { href: '/calls', icon: Phone, label: 'קריאות', highlight: false, minRole: undefined },
  { href: '/new-call', icon: PlusCircle, label: 'קריאה חדשה', highlight: false, minRole: undefined },
  { href: '/mci', icon: AlertTriangle, label: 'אמ"כ', highlight: true, minRole: undefined },
  { href: '/dashboard', icon: LayoutDashboard, label: 'דשבורד', highlight: false, minRole: 'supervisor' as const },
  { href: '/reports', icon: FileText, label: 'דוחות', highlight: false, minRole: undefined },
  { href: '/patients', icon: Users, label: 'מטופלים', highlight: false, minRole: undefined },
  { href: '/admin', icon: ShieldCheck, label: 'ניהול', highlight: false, minRole: 'admin' as const },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { role } = useUser()

  function isVisible(minRole: string | undefined) {
    if (!minRole) return true
    const levels: Record<string, number> = { emt: 1, paramedic: 2, supervisor: 3, admin: 4 }
    return (levels[role ?? ''] ?? 0) >= (levels[minRole] ?? 0)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 bg-[#1F4E78] text-white min-h-screen pt-4"
        role="navigation"
        aria-label="ניווט ראשי"
      >
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.filter(item => isVisible(item.minRole)).map(({ href, icon: Icon, label, highlight }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                  isActive
                    ? 'bg-white/20 text-white'
                    : highlight
                      ? 'text-red-300 hover:bg-red-500/20 hover:text-red-200'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} aria-hidden="true" className={highlight && !isActive ? 'text-red-400' : ''} />
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
        {NAV_ITEMS.filter(item => isVisible(item.minRole)).map(({ href, icon: Icon, label, highlight }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs min-h-[56px] transition-colors',
                isActive ? 'text-white' : highlight ? 'text-red-300' : 'text-white/60'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          )
        })}
        {/* הגדרות — תמיד בניווט המובייל */}
        <Link
          href="/settings"
          className={cn(
            'flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs min-h-[56px] transition-colors',
            pathname.startsWith('/settings') ? 'text-white' : 'text-white/60'
          )}
          aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
        >
          <Settings2 size={22} aria-hidden="true" />
          <span>הגדרות</span>
        </Link>
      </nav>
    </>
  )
}
