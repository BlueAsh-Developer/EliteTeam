import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  workspaceName: z.string().min(1, 'Workspace name is required'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
})

export const memberInviteSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
})

export const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  permissions: z.record(z.boolean()),
})

export const messageSchema = z.object({
  channel: z.string().min(1, 'Channel is required'),
  content: z.string().min(1, 'Message is required'),
})

export const callSchema = z.object({
  type: z.enum(['voice', 'video']),
  participants: z.array(z.string()).optional(),
  screenShare: z.boolean().default(false),
})

export const browserSessionSchema = z.object({
  url: z.string().url('Invalid URL'),
})

export const pluginSchema = z.object({
  name: z.string().min(1, 'Plugin name is required'),
  description: z.string().min(1, 'Description is required'),
  version: z.string().min(1, 'Version is required'),
})

export function safeParse<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  return schema.safeParse(data)
}
