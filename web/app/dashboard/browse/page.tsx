'use client'

import { useEffect, useState } from 'react'

export default function BrowsePage() {
  const [sessions, setSessions] = useState<{ id: string; url: string; events: { type: string; data: string }[]; createdAt: string }[]>([])
  const [url, setUrl] = useState('https://example.com')
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/browse')
    if (res.ok) {
      const data = await res.json()
      setSessions(data.sessions)
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
    const res = await fetch('/api/browse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    if (res.ok) {
      setUrl('https://example.com')
      load()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create session')
    }
  }

  async function postEvent(sessionId: string) {
    const eventType = prompt('Event type (navigate, click, scroll):') || 'navigate'
    const eventData = prompt('Event data:') || ''
    const res = await fetch('/api/browse', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, event: { type: eventType, data: eventData } }),
    })
    if (res.ok) load()
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="text-2xl font-bold">Team Browse</h1>
      </div>
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Create Session</h2>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={create} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">URL</label>
            <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Open Session</button>
        </form>
      </div>
      <div className="space-y-4">
        {sessions.map((s) => (
          <div key={s.id} className="card">
            <div className="flex justify-between items-center mb-3">
              <p className="font-medium break-all">{s.url}</p>
              <button onClick={() => postEvent(s.id)} className="btn btn-secondary text-sm">Log Event</button>
            </div>
            <div className="bg-black/30 rounded p-3 h-48 overflow-y-auto">
              {s.events.map((ev, i) => (
                <div key={i} className="text-xs mb-1">
                  <span className="text-slate-400">[{ev.type}]</span> {ev.data}
                </div>
              ))}
              {s.events.length === 0 && <p className="text-xs text-slate-500">No events yet.</p>}
            </div>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-slate-400">No browser sessions.</p>}
      </div>
    </div>
  )
}
