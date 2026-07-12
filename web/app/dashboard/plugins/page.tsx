'use client'

import { useEffect, useState } from 'react'

const MARKETPLACE = [
  { name: 'Slack Bridge', description: 'Sync messages with Slack', version: '1.2.0' },
  { name: 'GitHub Tracker', description: 'Track commits and PRs', version: '2.0.1' },
  { name: 'Notion Sync', description: 'Sync pages to Notion', version: '0.9.4' },
]

export default function PluginsPage() {
  const [installed, setInstalled] = useState<{ id: string; name: string; description: string; version: string }[]>([])
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/plugins')
    if (res.ok) {
      const data = await res.json()
      setInstalled(data.plugins)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  async function install(name: string, description: string, version: string) {
    setError('')
    const res = await fetch('/api/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, version }),
    })
    if (res.ok) load()
    else {
      const data = await res.json()
      setError(data.error || 'Failed to install')
    }
  }

  async function uninstall(id: string) {
    setError('')
    const res = await fetch(`/api/plugins?id=${id}`, { method: 'DELETE' })
    if (res.ok) load()
    else {
      const data = await res.json()
      setError(data.error || 'Failed to uninstall')
    }
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="text-2xl font-bold">Plugins</h1>
      </div>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Installed Plugins</h2>
        <div className="space-y-3">
          {installed.map((p) => (
            <div key={p.id} className="flex justify-between items-center p-3 bg-black/20 rounded">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-slate-400">{p.description} v{p.version}</p>
              </div>
              <button onClick={() => uninstall(p.id)} className="btn btn-secondary text-sm">Uninstall</button>
            </div>
          ))}
          {installed.length === 0 && <p className="text-slate-400">No plugins installed.</p>}
        </div>
      </div>
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Marketplace</h2>
        <div className="space-y-3">
          {MARKETPLACE.map((p) => (
            <div key={p.name} className="flex justify-between items-center p-3 bg-black/20 rounded">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-slate-400">{p.description} v{p.version}</p>
              </div>
              <button onClick={() => install(p.name, p.description, p.version)} className="btn btn-primary text-sm">Install</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
