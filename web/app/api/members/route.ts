import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, requireUser, hashPassword } from '@/lib/auth'
import { memberInviteSchema } from '@/lib/validation'
import { nanoid } from 'nanoid'

export async function GET(request: Request) {
  try {
    const session = await requireUser()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
    }
    const members = await db().members.listByWorkspace(workspaceId)
    const users = await Promise.all(members.map((m) => db().users.getById(m.userId)))
    const result = members.map((m, i) => ({
      ...m,
      user: users[i] ? { id: users[i].id, name: users[i].name, email: users[i].email } : null,
    }))
    return NextResponse.json({ members: result })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser()
    const body = await request.json()
    const parsed = memberInviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const { workspaceId } = parsed.data
    const { email, name, role } = parsed.data

    let user = await db().users.getByEmail(email)
    if (!user) {
      const passwordHash = await hashPassword(nanoid())
      user = await db().users.create({ email, name, passwordHash })
    }

    const existing = await db().members.getByWorkspaceAndUser(workspaceId, user.id)
    if (existing) {
      return NextResponse.json({ error: 'User already a member' }, { status: 400 })
    }

    const permissions = { 'roles.view': true, 'chat.send': true }
    if (role === 'admin') {
      Object.assign(permissions, { 'admin.settings': true, 'admin.invite': true, 'roles.edit': true })
    }

    const member = await db().members.add({ workspaceId, userId: user.id, role, permissions })
    return NextResponse.json({ member })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
