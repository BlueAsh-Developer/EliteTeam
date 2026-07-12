import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { can, defaultPermissionsForRole, PERMISSION_GROUPS } from '@/lib/permissions'
import Link from 'next/link'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const repo = await db()
  const workspaces = await repo.workspaces.listByUser(session.userId)
  const wsId = session.workspaceId || workspaces[0]?.id
  let memberCount = 0
  let messageCount = 0
  let callCount = 0
  let memberPermissions: Record<string, boolean> = {}

  if (wsId) {
    const members = await repo.members.listByWorkspace(wsId)
    memberCount = members.length
    const currentMember = members.find((m) => m.userId === session.userId)
    if (currentMember) {
      memberPermissions = currentMember.permissions
    }
    const messages = await repo.messages.list(wsId, 'general')
    messageCount = messages.length
    const calls = await repo.calls.list(wsId)
    callCount = calls.length
  }

  const role = memberPermissions['admin.settings'] ? 'owner' : memberPermissions['admin.invite'] ? 'admin' : memberPermissions['chat.send'] ? 'member' : 'viewer'
  const perms = defaultPermissionsForRole(role as 'owner' | 'admin' | 'member' | 'viewer')

  return (
    <div>
      <div className="topbar">
        <h1 className="text-2xl font-bold">Overview</h1>
        <LogoutButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-slate-400 text-sm">Workspaces</p>
          <p className="text-3xl font-bold mt-2">{workspaces.length}</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-sm">Team Members</p>
          <p className="text-3xl font-bold mt-2">{memberCount}</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-sm">Messages</p>
          <p className="text-3xl font-bold mt-2">{messageCount}</p>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Your Permissions</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PERMISSION_GROUPS).map((group) => (
            <span key={group} className="badge badge-success">{PERMISSION_GROUPS[group as keyof typeof PERMISSION_GROUPS]}</span>
          ))}
        </div>
        <p className="text-sm text-slate-400 mt-4">Active role: <span className="text-white font-medium capitalize">{role}</span></p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Workspaces</h2>
        <div className="space-y-3">
          {workspaces.map((ws) => (
            <div key={ws.id} className="flex justify-between items-center p-3 bg-black/20 rounded">
              <div>
                <p className="font-medium">{ws.name}</p>
                <p className="text-xs text-slate-400">Created {new Date(ws.createdAt).toLocaleDateString()}</p>
              </div>
              <Link href={`/dashboard/teams?workspaceId=${ws.id}`} className="btn btn-secondary text-sm">Manage</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
