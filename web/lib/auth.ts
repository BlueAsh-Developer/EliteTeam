import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me'
if (process.env.NODE_ENV === 'production' && AUTH_SECRET === 'dev-secret-change-me') {
  console.warn('WARNING: AUTH_SECRET is using the dev fallback in production.')
}
const secretKey = new TextEncoder().encode(AUTH_SECRET)

export type User = {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
}

export type Workspace = {
  id: string
  name: string
  ownerId: string
  createdAt: Date
}

export type Member = {
  id: string
  workspaceId: string
  userId: string
  role: string
  permissions: Record<string, boolean>
  createdAt: Date
}

export type Role = {
  id: string
  workspaceId: string
  name: string
  permissions: Record<string, boolean>
  createdAt: Date
}

export type Message = {
  id: string
  workspaceId: string
  channel: string
  userId: string
  content: string
  createdAt: Date
}

export type Call = {
  id: string
  workspaceId: string
  type: 'voice' | 'video'
  participants: string[]
  screenShare: boolean
  createdAt: Date
  endedAt?: Date
}

export type BrowserSession = {
  id: string
  workspaceId: string
  userId: string
  url: string
  events: { type: string; data: string; timestamp: Date }[]
  createdAt: Date
}

export type Plugin = {
  id: string
  workspaceId: string
  name: string
  description: string
  version: string
  installed: boolean
  installedAt?: Date
}

export type SessionPayload = {
  userId: string
  email: string
  workspaceId?: string
  memberId?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('eliteteam_session')?.value
  return verifySession(token)
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHENTICATED')
  }
  return session
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('eliteteam_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set('eliteteam_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
