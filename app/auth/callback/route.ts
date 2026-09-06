import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/account';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error || errorDescription) {
    const errorMsg = errorDescription || error || 'Authentication failed';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!exchangeError && data?.user) {
      // Sync user profile if profiles table exists
      try {
        const metadata = data.user.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || data.user.email?.split('@')[0];
        
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          avatar_url: metadata.avatar_url || metadata.picture || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (profileErr) {
        // Non-blocking
        console.error('Profile sync warning:', profileErr);
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else if (exchangeError) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    }
  }

  // Return the user to login page with an error state if no code was supplied
  return NextResponse.redirect(`${origin}/login?error=Authentication%20failed`);
}

