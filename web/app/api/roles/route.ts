import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, requireUser, can } from '@/lib/auth'
import { roleSchema } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const session = await requireUser()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
    }
    const roles = await db().roles.listByWorkspace(workspaceId)
    return NextResponse.json({ roles })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireUser()
    const member = session.memberId ? await db().members.getById(session.memberId) : null
    if (!member || !can(member, 'roles.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = roleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const updated = await db().members.update(parsed.data.id, { permissions: parsed.data.permissions })
    return NextResponse.json({ member: updated })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
