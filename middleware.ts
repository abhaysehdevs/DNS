import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // 1. Enforce Non-WWW Canonical Host (Fixes GSC "Alternate page with proper canonical tag" for www pages)
  if (host.startsWith('www.')) {
    const cleanHost = host.replace(/^www\./, '');
    const redirectUrl = new URL(request.url);
    redirectUrl.host = cleanHost;
    redirectUrl.protocol = 'https:';
    return NextResponse.redirect(redirectUrl, { status: 301 });
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

