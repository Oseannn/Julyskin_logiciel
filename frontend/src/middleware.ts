import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes publiques
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next()
  }

  // Vérifier l'authentification pour les routes protégées
  if (pathname.startsWith('/dashboard')) {
    // Note: En production, vous devriez vérifier le token JWT côté serveur
    // Pour l'instant, on laisse le client gérer la redirection
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
