'use client'

import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  async function logout() {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  return (
    <button onClick={logout} className="btn btn-secondary" disabled={loading}>
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}
