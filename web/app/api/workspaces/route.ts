import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, requireUser } from '@/lib/auth'
import { workspaceSchema } from '@/lib/validation'

export async function GET() {
  try {
    const session = await requireUser()
    const workspaces = await db().workspaces.listByUser(session.userId)
    return NextResponse.json({ workspaces })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser()
    const body = await request.json()
    const parsed = workspaceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e: { message: string }) => e.message).join(', ') }, { status: 400 })
    }

    const workspace = await db().workspaces.create({ name: parsed.data.name, ownerId: session.userId })
    await db().members.add({ workspaceId: workspace.id, userId: session.userId, role: 'owner', permissions: { 'admin.settings': true, 'roles.edit': true } })
    return NextResponse.json({ workspace })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
