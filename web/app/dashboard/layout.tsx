import { redirect } from 'next/navigation'
import { requireUser, clearSessionCookie } from '@/lib/auth'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    const session = await requireUser()
    return (
      <div className="flex min-h-screen">
        <aside className="sidebar">
          <div className="mb-8">
            <h2 className="text-xl font-bold">EliteTeam</h2>
            <p className="text-xs text-slate-400 mt-1">{session.email}</p>
          </div>
          <nav className="space-y-1">
            <Link href="/dashboard" className="nav-item">Overview</Link>
            <Link href="/dashboard/teams" className="nav-item">Teams</Link>
            <Link href="/dashboard/roles" className="nav-item">Roles</Link>
            <Link href="/dashboard/chat" className="nav-item">Chat</Link>
            <Link href="/dashboard/meet" className="nav-item">Meet</Link>
            <Link href="/dashboard/browse" className="nav-item">Browse</Link>
            <Link href="/dashboard/plugins" className="nav-item">Plugins</Link>
          </nav>
        </aside>
        <main className="main flex-1">{children}</main>
      </div>
    )
  } catch {
    redirect('/login')
  }
}
