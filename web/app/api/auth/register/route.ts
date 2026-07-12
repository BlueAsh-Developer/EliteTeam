import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signSession, setSessionCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const { name, email, password, workspaceName } = parsed.data
    const repo = await db()
    const existing = await repo.users.getByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const user = await repo.users.create({ email, name, passwordHash })
    const workspace = await repo.workspaces.create({ name: workspaceName, ownerId: user.id })
    await repo.members.add({ workspaceId: workspace.id, userId: user.id, role: 'owner', permissions: { 'admin.settings': true, 'roles.edit': true, 'admin.invite': true, 'admin.removeMember': true, 'workspace.rename': true } })

    const token = await signSession({ userId: user.id, email: user.email, workspaceId: workspace.id })
    await setSessionCookie(token)

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, workspaceId: workspace.id } })
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
