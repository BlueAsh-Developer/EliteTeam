'use client'

import { useEffect, useState } from 'react'
import { getSession } from '@/lib/auth'

export default function ChatPage() {
  const [messages, setMessages] = useState<{ id: string; content: string; channel: string; createdAt: string; user?: { name: string } }[]>([])
  const [channel, setChannel] = useState('general')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch(`/api/chat?channel=${channel}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data.messages)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [channel])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, content }),
    })
    if (res.ok) {
      setContent('')
      load()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to send')
    }
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="text-2xl font-bold">Team Chat</h1>
      </div>
      <div className="card flex flex-col h-[600px]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-slate-400">Channel:</span>
          <input className="input w-48" value={channel} onChange={(e) => setChannel(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((m) => (
            <div key={m.id} className="p-3 bg-black/20 rounded">
              <div className="flex justify-between">
                <span className="font-medium text-sm">{m.user?.name || 'Unknown'}</span>
                <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="mt-1 text-sm">{m.content}</p>
            </div>
          ))}
          {messages.length === 0 && <p className="text-slate-400 text-center py-8">No messages yet.</p>}
        </div>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={send} className="flex gap-2">
          <input className="input flex-1" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message..." required />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  )
}
