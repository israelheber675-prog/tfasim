import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppInit } from '@/components/layout/AppInit'
import { PWAInstallBanner } from '@/components/layout/PWAInstallBanner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <AppInit />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0" role="main">
          {children}
        </main>
      </div>
      <PWAInstallBanner />
    </div>
  )
}
