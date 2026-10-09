import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // 1. Single-hop permanent 301 from www to apex
  if (host.startsWith('www.dinanathandsons.com')) {
    const targetUrl = new URL(request.url);
    targetUrl.host = 'dinanathandsons.com';
    targetUrl.protocol = 'https:';
    return NextResponse.redirect(targetUrl.toString(), 301);
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
