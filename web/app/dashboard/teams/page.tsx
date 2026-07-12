import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import InviteForm from './invite-form'

export default async function TeamsPage({ searchParams }: { searchParams: { workspaceId?: string } }) {
  const session = await getSession()
  if (!session) return null

  const repo = await db()
  const workspaces = await repo.workspaces.listByUser(session.userId)
  const wsId = searchParams.workspaceId || session.workspaceId || workspaces[0]?.id
  const members = wsId ? await repo.members.listByWorkspace(wsId) : []
  const users = await Promise.all(members.map((m) => db().users.getById(m.userId)))

  return (
    <div>
      <div className="topbar">
        <h1 className="text-2xl font-bold">Teams</h1>
      </div>
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Invite Member</h2>
        <InviteForm workspaceId={wsId || ''} />
      </div>
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Members</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id} className="border-b border-slate-800">
                <td className="py-3">{users[i]?.name || 'Unknown'}</td>
                <td className="py-3">{users[i]?.email || 'Unknown'}</td>
                <td className="py-3"><span className="badge badge-success capitalize">{m.role}</span></td>
                <td className="py-3 text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
