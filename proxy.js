import { auth } from './auth'
import { NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/compose', '/radar', '/discover', '/observatory', '/playground']
const AUTH_ROUTES = ['/signin', '/signup']

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const path = nextUrl.pathname

  const isProtected = PROTECTED_ROUTES.some(r => path.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => path.startsWith(r))

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(path)
    return NextResponse.redirect(new URL(`/signin?callbackUrl=${callbackUrl}`, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/compose/:path*',
    '/radar/:path*',
    '/discover/:path*',
    '/observatory/:path*',
    '/playground/:path*',
    '/signin',
    '/signup',
  ],
}
