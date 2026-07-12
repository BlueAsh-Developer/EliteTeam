import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, requireUser } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { callSchema } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const session = await requireUser()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId') || session.workspaceId
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace' }, { status: 400 })
    }
    const calls = await db().calls.list(workspaceId)
    return NextResponse.json({ calls })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser()
    const member = session.memberId ? await db().members.getById(session.memberId) : null
    if (!member || !can(member, 'voice.call') && !can(member, 'video.call')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = callSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const call = await db().calls.create({ workspaceId: session.workspaceId!, type: parsed.data.type, participants: parsed.data.participants || [session.userId], screenShare: parsed.data.screenShare })
    return NextResponse.json({ call })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
