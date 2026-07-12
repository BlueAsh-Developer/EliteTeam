import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, requireUser } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { messageSchema } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const session = await requireUser()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId') || session.workspaceId
    const channel = searchParams.get('channel') || 'general'
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace' }, { status: 400 })
    }
    const repo = await db()
    const messages = await repo.messages.list(workspaceId, channel)
    const users = await Promise.all(Array.from(new Set(messages.map((m) => m.userId))).map((id) => repo.users.getById(id)))
    const userMap = new Map(users.filter(Boolean).map((u) => [u!.id, u!]))
    return NextResponse.json({ messages: messages.map((m) => ({ ...m, user: userMap.get(m.userId) })) })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser()
    const repo = await db()
    const member = session.memberId ? await repo.members.getById(session.memberId) : null
    if (!member || !can(member, 'chat.send')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = messageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const message = await repo.messages.add({ workspaceId: session.workspaceId!, channel: parsed.data.channel, userId: session.userId, content: parsed.data.content })
    const user = await repo.users.getById(session.userId)
    return NextResponse.json({ message: { ...message, user } })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
