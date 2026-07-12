import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, signSession, setSessionCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const { email, password } = parsed.data
    const repo = await db()
    const user = await repo.users.getByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const workspaces = await repo.workspaces.listByUser(user.id)
    const workspaceId = workspaces[0]?.id
    const member = workspaceId ? await repo.members.getByWorkspaceAndUser(workspaceId, user.id) : null

    const token = await signSession({ userId: user.id, email: user.email, workspaceId, memberId: member?.id })
    await setSessionCookie(token)

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, workspaceId, memberId: member?.id } })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
