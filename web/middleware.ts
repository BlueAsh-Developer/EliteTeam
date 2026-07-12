import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('eliteteam_session')?.value
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
