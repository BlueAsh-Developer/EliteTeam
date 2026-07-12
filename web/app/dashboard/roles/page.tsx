import { db } from '@/lib/db'
import { getSession, requireUser, can, PERMISSIONS, PERMISSION_GROUPS, flattenPermissions, expandPermissions } from '@/lib/permissions'
import { requireUser as authRequireUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function RolesPage({ searchParams }: { searchParams: { workspaceId?: string } }) {
  try {
    const session = await authRequireUser()
    const member = session.memberId ? await db().members.getById(session.memberId) : null
    if (!member || !can(member, 'roles.view')) {
      redirect('/dashboard')
    }

    const workspaces = await db().workspaces.listByUser(session.userId)
    const wsId = searchParams.workspaceId || session.workspaceId || workspaces[0]?.id
    const roles = wsId ? await db().roles.listByWorkspace(wsId) : []
    const members = wsId ? await db().members.listByWorkspace(wsId) : []

    return (
      <div>
        <div className="topbar">
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        </div>
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Permission Matrix</h2>
          {Object.keys(PERMISSION_GROUPS).map((group) => (
            <div key={group} className="mb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{PERMISSION_GROUPS[group as keyof typeof PERMISSION_GROUPS]}</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PERMISSIONS[group as keyof typeof PERMISSIONS]).map(([key, perm]) => (
                  <span key={perm} className="badge badge-success text-xs">{perm}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Roles</h2>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="p-4 bg-black/20 rounded">
                <p className="font-medium">{role.name}</p>
                <pre className="text-xs text-slate-400 mt-2 overflow-auto">{JSON.stringify(role.permissions, null, 2)}</pre>
              </div>
            ))}
            {roles.length === 0 && <p className="text-slate-400">No roles yet.</p>}
          </div>
        </div>
      </div>
    )
  } catch {
    redirect('/login')
  }
}
