import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const members = pgTable('members', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('member'),
  permissions: jsonb('permissions').$type<Record<string, boolean>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  permissions: jsonb('permissions').$type<Record<string, boolean>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  channel: text('channel').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const calls = pgTable('calls', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  type: text('type').notNull(),
  participants: jsonb('participants').$type<string[]>(),
  screenShare: boolean('screen_share').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
})

export const browserSessions = pgTable('browser_sessions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').notNull().references(() => users.id),
  url: text('url').notNull(),
  events: jsonb('events').$type<{ type: string; data: string; timestamp: string }[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const plugins = pgTable('plugins', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  version: text('version').notNull(),
  installed: boolean('installed').default(true),
  installedAt: timestamp('installed_at'),
})

export const schema = { users, workspaces, members, roles, messages, calls, browserSessions, plugins }
