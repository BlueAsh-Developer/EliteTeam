'use client'

import { useState } from 'react'

export default function InviteForm({ workspaceId }: { workspaceId: string }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('member')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role, workspaceId }),
    })
    if (res.ok) {
      setEmail('')
      setName('')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to invite')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="flex gap-3 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Inviting...' : 'Invite'}</button>
    </form>
  )
}
