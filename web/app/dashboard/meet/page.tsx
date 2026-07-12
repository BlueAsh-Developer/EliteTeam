'use client'

import { useEffect, useState } from 'react'

export default function MeetPage() {
  const [calls, setCalls] = useState<{ id: string; type: string; screenShare: boolean; createdAt: string }[]>([])
  const [type, setType] = useState<'voice' | 'video'>('video')
  const [screenShare, setScreenShare] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/calls')
    if (res.ok) {
      const data = await res.json()
      setCalls(data.calls)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, screenShare }),
    })
    if (res.ok) {
      setScreenShare(false)
      load()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create call')
    }
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="text-2xl font-bold">Team Meet</h1>
      </div>
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Start a Call</h2>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={create} className="flex gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as 'voice' | 'video')}>
              <option value="voice">Voice</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="screen" checked={screenShare} onChange={(e) => setScreenShare(e.target.checked)} />
            <label htmlFor="screen" className="text-sm">Screen Share</label>
          </div>
          <button type="submit" className="btn btn-primary">Start Call</button>
        </form>
      </div>
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Active Calls</h2>
        <div className="space-y-3">
          {calls.map((c) => (
            <div key={c.id} className="p-3 bg-black/20 rounded flex justify-between">
              <div>
                <p className="font-medium capitalize">{c.type} Call</p>
                <p className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
              {c.screenShare && <span className="badge badge-warning">Screen Share</span>}
            </div>
          ))}
          {calls.length === 0 && <p className="text-slate-400">No active calls.</p>}
        </div>
      </div>
    </div>
  )
}
