import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // 1. Canonical Domain Redirection: Force apex domain (strip www.)
  if (host.startsWith('www.')) {
    const newHost = host.replace(/^www\./, '');
    const url = request.nextUrl.clone();
    url.host = newHost;
    url.protocol = 'https';
    return NextResponse.redirect(url, { status: 301 });
  }

  return await createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
