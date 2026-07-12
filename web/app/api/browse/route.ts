import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, requireUser, can } from '@/lib/auth'
import { browserSessionSchema } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const session = await requireUser()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId') || session.workspaceId
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace' }, { status: 400 })
    }
    const sessions = await db().browserSessions.list(workspaceId)
    return NextResponse.json({ sessions })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser()
    const member = session.memberId ? await db().members.getById(session.memberId) : null
    if (!member || !can(member, 'browse.session.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = browserSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const sessionData = await db().browserSessions.create({ workspaceId: session.workspaceId!, userId: session.userId, url: parsed.data.url })
    return NextResponse.json({ session: sessionData })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireUser()
    const body = await request.json()
    const { sessionId, event } = body
    if (!sessionId || !event) {
      return NextResponse.json({ error: 'sessionId and event required' }, { status: 400 })
    }

    const existing = await db().browserSessions.list(session.workspaceId!)
    const target = existing.find((s) => s.id === sessionId)
    if (!target) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const member = session.memberId ? await db().members.getById(session.memberId) : null
    if (!member || !can(member, 'browse.control')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await db().browserSessions.appendEvent(sessionId, event)
    return NextResponse.json({ session: updated })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
