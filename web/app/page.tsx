import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">EliteTeam</h1>
        <p className="text-xl text-slate-400">Team communication, collaboration, and control — unified.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn btn-primary">Sign In</Link>
          <Link href="/register" className="btn btn-secondary">Create Account</Link>
        </div>
        <p className="text-sm text-slate-500">
          Demo: demo@eliteteam.app / demo1234
        </p>
      </div>
    </div>
  )
}
