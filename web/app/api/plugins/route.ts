import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, requireUser } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { pluginSchema } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const session = await requireUser()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId') || session.workspaceId
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace' }, { status: 400 })
    }
    const repo = await db()
    const plugins = await repo.plugins.list(workspaceId)
    return NextResponse.json({ plugins })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser()
    const repo = await db()
    const member = session.memberId ? await repo.members.getById(session.memberId) : null
    if (!member || !can(member, 'plugins.install')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = pluginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const plugin = await repo.plugins.install({ workspaceId: session.workspaceId!, name: parsed.data.name, description: parsed.data.description, version: parsed.data.version })
    return NextResponse.json({ plugin })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireUser()
    const repo = await db()
    const member = session.memberId ? await repo.members.getById(session.memberId) : null
    if (!member || !can(member, 'plugins.uninstall')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Plugin id required' }, { status: 400 })
    }

    const ok = await repo.plugins.uninstall(id)
    return NextResponse.json({ ok })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
