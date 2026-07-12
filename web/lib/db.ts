import { hashPassword, type User, type Workspace, type Member, type Role, type Message, type Call, type BrowserSession, type Plugin } from './auth'
import { schema } from '../drizzle/schema'
import { sql } from 'drizzle-orm'

export interface Repo {
  users: {
    create(user: { email: string; name: string; passwordHash: string }): Promise<User>
    getByEmail(email: string): Promise<User | undefined>
    getById(id: string): Promise<User | undefined>
    update(id: string, data: Partial<Pick<User, 'name' | 'email'>>): Promise<User | undefined>
  }
  workspaces: {
    create(workspace: { name: string; ownerId: string }): Promise<Workspace>
    getById(id: string): Promise<Workspace | undefined>
    listByUser(userId: string): Promise<Workspace[]>
    update(id: string, data: Partial<Pick<Workspace, 'name'>>): Promise<Workspace | undefined>
  }
  members: {
    add(member: { workspaceId: string; userId: string; role: string; permissions: Record<string, boolean> }): Promise<Member>
    listByWorkspace(workspaceId: string): Promise<Member[]>
    getById(id: string): Promise<Member | undefined>
    getByWorkspaceAndUser(workspaceId: string, userId: string): Promise<Member | undefined>
    update(id: string, data: Partial<Pick<Member, 'role' | 'permissions'>>): Promise<Member | undefined>
  }
  roles: {
    create(role: { workspaceId: string; name: string; permissions: Record<string, boolean> }): Promise<Role>
    listByWorkspace(workspaceId: string): Promise<Role[]>
    getById(id: string): Promise<Role | undefined>
    update(id: string, data: Partial<Pick<Role, 'name' | 'permissions'>>): Promise<Role | undefined>
  }
  messages: {
    add(message: { workspaceId: string; channel: string; userId: string; content: string }): Promise<Message>
    list(workspaceId: string, channel: string): Promise<Message[]>
  }
  calls: {
    create(call: { workspaceId: string; type: 'voice' | 'video'; participants: string[]; screenShare: boolean }): Promise<Call>
    list(workspaceId: string): Promise<Call[]>
    update(id: string, data: Partial<Pick<Call, 'endedAt' | 'participants' | 'screenShare'>>): Promise<Call | undefined>
  }
  browserSessions: {
    create(session: { workspaceId: string; userId: string; url: string }): Promise<BrowserSession>
    list(workspaceId: string): Promise<BrowserSession[]>
    appendEvent(id: string, event: { type: string; data: string }): Promise<BrowserSession | undefined>
  }
  plugins: {
    install(plugin: { workspaceId: string; name: string; description: string; version: string }): Promise<Plugin>
    list(workspaceId: string): Promise<Plugin[]>
    uninstall(id: string): Promise<boolean>
  }
}

function createMemoryRepo(): Repo {
  const users = new Map<string, User>()
  const workspaces = new Map<string, Workspace>()
  const members = new Map<string, Member>()
  const roles = new Map<string, Role>()
  const messages = new Map<string, Message>()
  const calls = new Map<string, Call>()
  const browserSessions = new Map<string, BrowserSession>()
  const plugins = new Map<string, Plugin>()

  const defaults = {
    users: [] as User[],
    workspaces: [] as Workspace[],
    members: [] as Member[],
    roles: [] as Role[],
    messages: [] as Message[],
    calls: [] as Call[],
    browserSessions: [] as BrowserSession[],
    plugins: [] as Plugin[],
  }

  return {
    users: {
      create: async (u) => {
        const user: User = { id: nanoid(), email: u.email, name: u.name, passwordHash: u.passwordHash, createdAt: new Date() }
        users.set(user.id, user)
        defaults.users.push(user)
        return user
      },
      getByEmail: async (email) => defaults.users.find((u) => u.email === email),
      getById: async (id) => users.get(id),
      update: async (id, data) => {
        const existing = users.get(id)
        if (!existing) return undefined
        const updated = { ...existing, ...data }
        users.set(id, updated)
        defaults.users = defaults.users.map((u) => (u.id === id ? updated : u))
        return updated
      },
    },
    workspaces: {
      create: async (w) => {
        const workspace: Workspace = { id: nanoid(), name: w.name, ownerId: w.ownerId, createdAt: new Date() }
        workspaces.set(workspace.id, workspace)
        defaults.workspaces.push(workspace)
        return workspace
      },
      getById: async (id) => workspaces.get(id),
      listByUser: async (userId) => defaults.workspaces.filter((w) => w.ownerId === userId),
      update: async (id, data) => {
        const existing = workspaces.get(id)
        if (!existing) return undefined
        const updated = { ...existing, ...data }
        workspaces.set(id, updated)
        defaults.workspaces = defaults.workspaces.map((w) => (w.id === id ? updated : w))
        return updated
      },
    },
    members: {
      add: async (m) => {
        const member: Member = { id: nanoid(), workspaceId: m.workspaceId, userId: m.userId, role: m.role, permissions: m.permissions, createdAt: new Date() }
        members.set(member.id, member)
        defaults.members.push(member)
        return member
      },
      listByWorkspace: async (workspaceId) => defaults.members.filter((m) => m.workspaceId === workspaceId),
      getById: async (id) => members.get(id),
      getByWorkspaceAndUser: async (workspaceId, userId) => defaults.members.find((m) => m.workspaceId === workspaceId && m.userId === userId),
      update: async (id, data) => {
        const existing = members.get(id)
        if (!existing) return undefined
        const updated = { ...existing, ...data }
        members.set(id, updated)
        defaults.members = defaults.members.map((m) => (m.id === id ? updated : m))
        return updated
      },
    },
    roles: {
      create: async (r) => {
        const role: Role = { id: nanoid(), workspaceId: r.workspaceId, name: r.name, permissions: r.permissions, createdAt: new Date() }
        roles.set(role.id, role)
        defaults.roles.push(role)
        return role
      },
      listByWorkspace: async (workspaceId) => defaults.roles.filter((r) => r.workspaceId === workspaceId),
      getById: async (id) => roles.get(id),
      update: async (id, data) => {
        const existing = roles.get(id)
        if (!existing) return undefined
        const updated = { ...existing, ...data }
        roles.set(id, updated)
        defaults.roles = defaults.roles.map((r) => (r.id === id ? updated : r))
        return updated
      },
    },
    messages: {
      add: async (m) => {
        const message: Message = { id: nanoid(), workspaceId: m.workspaceId, channel: m.channel, userId: m.userId, content: m.content, createdAt: new Date() }
        messages.set(message.id, message)
        defaults.messages.push(message)
        return message
      },
      list: async (workspaceId, channel) => defaults.messages.filter((m) => m.workspaceId === workspaceId && m.channel === channel).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    },
    calls: {
      create: async (c) => {
        const call: Call = { id: nanoid(), workspaceId: c.workspaceId, type: c.type, participants: c.participants, screenShare: c.screenShare, createdAt: new Date() }
        calls.set(call.id, call)
        defaults.calls.push(call)
        return call
      },
      list: async (workspaceId) => defaults.calls.filter((c) => c.workspaceId === workspaceId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      update: async (id, data) => {
        const existing = calls.get(id)
        if (!existing) return undefined
        const updated = { ...existing, ...data }
        calls.set(id, updated)
        return updated
      },
    },
    browserSessions: {
      create: async (s) => {
        const session: BrowserSession = { id: nanoid(), workspaceId: s.workspaceId, userId: s.userId, url: s.url, events: [], createdAt: new Date() }
        browserSessions.set(session.id, session)
        defaults.browserSessions.push(session)
        return session
      },
      list: async (workspaceId) => defaults.browserSessions.filter((s) => s.workspaceId === workspaceId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      appendEvent: async (id, event) => {
        const existing = browserSessions.get(id)
        if (!existing) return undefined
        existing.events.push({ ...event, timestamp: new Date() })
        browserSessions.set(id, existing)
        return existing
      },
    },
    plugins: {
      install: async (p) => {
        const plugin: Plugin = { id: nanoid(), workspaceId: p.workspaceId, name: p.name, description: p.description, version: p.version, installed: true, installedAt: new Date() }
        plugins.set(plugin.id, plugin)
        defaults.plugins.push(plugin)
        return plugin
      },
      list: async (workspaceId) => defaults.plugins.filter((p) => p.workspaceId === workspaceId),
      uninstall: async (id) => {
        const existing = plugins.get(id)
        if (!existing) return false
        existing.installed = false
        existing.installedAt = undefined
        plugins.set(id, existing)
        defaults.plugins = defaults.plugins.map((p) => (p.id === id ? existing : p))
        return true
      },
    },
  }
}

export type DB = {
  users: Repo['users']
  workspaces: Repo['workspaces']
  members: Repo['members']
  roles: Repo['roles']
  messages: Repo['messages']
  calls: Repo['calls']
  browserSessions: Repo['browserSessions']
  plugins: Repo['plugins']
}

let memoryRepo: Repo | null = null
let pgRepo: Repo | null = null

export async function getRepo(): Promise<Repo> {
  if (memoryRepo) return memoryRepo
  memoryRepo = createMemoryRepo()
  await seedDefaults(memoryRepo)
  return memoryRepo
}

export async function getPgRepo(): Promise<Repo | null> {
  if (!process.env.DATABASE_URL) return null
  if (pgRepo) return pgRepo
  try {
    const { drizzle } = await import('drizzle-orm/postgres-js')
    const postgres = (await import('postgres')).default
    const client = postgres(process.env.DATABASE_URL, { max: 1 })
    const db = drizzle(client)

    pgRepo = {
      users: {
        create: async (u) => {
          const [row] = await db.insert(schema.users).values({ email: u.email, name: u.name, passwordHash: u.passwordHash }).returning()
          return row as unknown as User
        },
        getByEmail: async (email) => {
          const row = await db.select().from(schema.users).where(sql`${schema.users.email} = ${email}`).limit(1)
          return row[0] as User | undefined
        },
        getById: async (id) => {
          const row = await db.select().from(schema.users).where(sql`${schema.users.id} = ${id}`).limit(1)
          return row[0] as User | undefined
        },
        update: async (id, data) => {
          const [row] = await db.update(schema.users).set(data).where(sql`${schema.users.id} = ${id}`).returning()
          return row as User | undefined
        },
      },
      workspaces: {
        create: async (w) => {
          const [row] = await db.insert(schema.workspaces).values({ name: w.name, ownerId: w.ownerId }).returning()
          return row as unknown as Workspace
        },
        getById: async (id) => {
          const row = await db.select().from(schema.workspaces).where(sql`${schema.workspaces.id} = ${id}`).limit(1)
          return row[0] as Workspace | undefined
        },
        listByUser: async (userId) => {
          const rows = await db.select().from(schema.workspaces).where(sql`${schema.workspaces.ownerId} = ${userId}`)
          return rows as Workspace[]
        },
        update: async (id, data) => {
          const [row] = await db.update(schema.workspaces).set(data).where(sql`${schema.workspaces.id} = ${id}`).returning()
          return row as Workspace | undefined
        },
      },
      members: {
        add: async (m) => {
          const [row] = await db.insert(schema.members).values({ workspaceId: m.workspaceId, userId: m.userId, role: m.role, permissions: m.permissions }).returning()
          return row as unknown as Member
        },
        listByWorkspace: async (workspaceId) => {
          const rows = await db.select().from(schema.members).where(sql`${schema.members.workspaceId} = ${workspaceId}`)
          return rows as Member[]
        },
        getById: async (id) => {
          const row = await db.select().from(schema.members).where(sql`${schema.members.id} = ${id}`).limit(1)
          return row[0] as Member | undefined
        },
        getByWorkspaceAndUser: async (workspaceId, userId) => {
          const row = await db.select().from(schema.members).where(sql`${schema.members.workspaceId} = ${workspaceId} AND ${schema.members.userId} = ${userId}`).limit(1)
          return row[0] as Member | undefined
        },
        update: async (id, data) => {
          const [row] = await db.update(schema.members).set(data).where(sql`${schema.members.id} = ${id}`).returning()
          return row as Member | undefined
        },
      },
      roles: {
        create: async (r) => {
          const [row] = await db.insert(schema.roles).values({ workspaceId: r.workspaceId, name: r.name, permissions: r.permissions }).returning()
          return row as unknown as Role
        },
        listByWorkspace: async (workspaceId) => {
          const rows = await db.select().from(schema.roles).where(sql`${schema.roles.workspaceId} = ${workspaceId}`)
          return rows as Role[]
        },
        getById: async (id) => {
          const row = await db.select().from(schema.roles).where(sql`${schema.roles.id} = ${id}`).limit(1)
          return row[0] as Role | undefined
        },
        update: async (id, data) => {
          const [row] = await db.update(schema.roles).set(data).where(sql`${schema.roles.id} = ${id}`).returning()
          return row as Role | undefined
        },
      },
      messages: {
        add: async (m) => {
          const [row] = await db.insert(schema.messages).values({ workspaceId: m.workspaceId, channel: m.channel, userId: m.userId, content: m.content }).returning()
          return row as unknown as Message
        },
        list: async (workspaceId, channel) => {
          const rows = await db.select().from(schema.messages).where(sql`${schema.messages.workspaceId} = ${workspaceId} AND ${schema.messages.channel} = ${channel}`).orderBy(schema.messages.createdAt)
          return rows as Message[]
        },
      },
      calls: {
        create: async (c) => {
          const [row] = await db.insert(schema.calls).values({ workspaceId: c.workspaceId, type: c.type, participants: c.participants, screenShare: c.screenShare }).returning()
          return row as unknown as Call
        },
        list: async (workspaceId) => {
          const rows = await db.select().from(schema.calls).where(sql`${schema.calls.workspaceId} = ${workspaceId}`).orderBy(schema.calls.createdAt)
          return rows as Call[]
        },
        update: async (id, data) => {
          const [row] = await db.update(schema.calls).set(data).where(sql`${schema.calls.id} = ${id}`).returning()
          return row as Call | undefined
        },
      },
      browserSessions: {
        create: async (s) => {
          const [row] = await db.insert(schema.browserSessions).values({ workspaceId: s.workspaceId, userId: s.userId, url: s.url }).returning()
          return row as unknown as BrowserSession
        },
        list: async (workspaceId) => {
          const rows = await db.select().from(schema.browserSessions).where(sql`${schema.browserSessions.workspaceId} = ${workspaceId}`).orderBy(schema.browserSessions.createdAt)
          return rows as BrowserSession[]
        },
        appendEvent: async (id, event) => {
          const existing = await db.select().from(schema.browserSessions).where(sql`${schema.browserSessions.id} = ${id}`).limit(1)
          if (!existing[0]) return undefined
          const events = [...(existing[0] as BrowserSession).events, { ...event, timestamp: new Date() }]
          const [row] = await db.update(schema.browserSessions).set({ events }).where(sql`${schema.browserSessions.id} = ${id}`).returning()
          return row as BrowserSession | undefined
        },
      },
      plugins: {
        install: async (p) => {
          const [row] = await db.insert(schema.plugins).values({ workspaceId: p.workspaceId, name: p.name, description: p.description, version: p.version, installed: true }).returning()
          return row as unknown as Plugin
        },
        list: async (workspaceId) => {
          const rows = await db.select().from(schema.plugins).where(sql`${schema.plugins.workspaceId} = ${workspaceId}`)
          return rows as Plugin[]
        },
        uninstall: async (id) => {
          const [row] = await db.update(schema.plugins).set({ installed: false }).where(sql`${schema.plugins.id} = ${id}`).returning()
          return !!row
        },
      },
    }
    return pgRepo
  } catch (e) {
    console.error('Failed to initialize Postgres repo', e)
    return null
  }
}

export async function db(): Promise<Repo> {
  const pg = await getPgRepo()
  return pg ?? getRepo()
}

async function seedDefaults(repo: Repo) {
  const existing = await repo.users.getByEmail('demo@eliteteam.app')
  if (existing) return

  const passwordHash = await hashPassword('demo1234')
  const user = await repo.users.create({ email: 'demo@eliteteam.app', name: 'Demo Admin', passwordHash })
  const workspace = await repo.workspaces.create({ name: 'Demo Workspace', ownerId: user.id })
  await repo.members.add({ workspaceId: workspace.id, userId: user.id, role: 'owner', permissions: { 'admin.settings': true, 'roles.edit': true, 'admin.invite': true, 'admin.removeMember': true, 'workspace.rename': true } })
}
