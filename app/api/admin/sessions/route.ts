import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

function getAdminClient() {
    return createClient(supabaseUrl, supabaseKey);
}

function parseClientDetails(req: Request) {
    const forwarded = req.headers.get('x-forwarded-for');
    let ip = '127.0.0.1';
    if (forwarded) {
        const parts = forwarded.split(',').map(s => s.trim());
        const valid = parts.find(p => p && p !== '127.0.0.1' && p !== '::1' && !p.startsWith('10.') && !p.startsWith('192.168.'));
        ip = valid || parts[0] || '127.0.0.1';
    } else {
        ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '127.0.0.1';
    }

    const ua = req.headers.get('user-agent') || 'Unknown Device';
    let browser = 'Unknown Browser';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

    let os = 'Unknown OS';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    const city = req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity') || '';
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'India';

    return { ip, browser, os, city, country, deviceInfo: `${browser} on ${os}` };
}

// GET: Retrieve all active admin sessions
export async function GET() {
    try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from('admin_sessions')
            .select('*')
            .is('revoked_at', null)
            .order('last_active', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching admin sessions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, sessions: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Register or update a session heartbeat
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { sessionId, userEmail } = body;
        const details = parseClientDetails(req);
        const supabase = getAdminClient();

        if (sessionId) {
            // Check if session has been revoked
            const { data: existing } = await supabase
                .from('admin_sessions')
                .select('id, revoked_at')
                .eq('id', sessionId)
                .single();

            if (existing && existing.revoked_at) {
                return NextResponse.json({ 
                    revoked: true, 
                    message: 'This session has been revoked by an administrator.' 
                }, { status: 401 });
            }

            // Update heartbeat and network info
            const { data, error } = await supabase
                .from('admin_sessions')
                .update({
                    last_active: new Date().toISOString(),
                    ip_address: details.ip,
                    browser: details.browser,
                    os: details.os,
                    device_info: details.deviceInfo,
                    city: details.city || undefined,
                    country: details.country || undefined,
                    user_email: userEmail || undefined
                })
                .eq('id', sessionId)
                .select()
                .single();

            if (!error && data) {
                return NextResponse.json({ success: true, session: data });
            }
        }

        // Create new session
        const { data: newSession, error: createError } = await supabase
            .from('admin_sessions')
            .insert({
                user_email: userEmail || 'ajayabhay12872@gmail.com',
                device_info: details.deviceInfo,
                browser: details.browser,
                os: details.os,
                ip_address: details.ip,
                city: details.city,
                country: details.country,
                last_active: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating admin session:', createError);
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, session: newSession });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Revoke a single session or all other sessions
export async function DELETE(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { sessionId, revokeAllOthers, currentSessionId } = body;
        const supabase = getAdminClient();

        if (revokeAllOthers && currentSessionId) {
            // Revoke all sessions except the current one
            const { error } = await supabase
                .from('admin_sessions')
                .update({ revoked_at: new Date().toISOString() })
                .neq('id', currentSessionId)
                .is('revoked_at', null);

            if (error) throw error;
            return NextResponse.json({ success: true, message: 'All other devices signed out.' });
        }

        if (sessionId) {
            const { error } = await supabase
                .from('admin_sessions')
                .update({ revoked_at: new Date().toISOString() })
                .eq('id', sessionId);

            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Session revoked.' });
        }

        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
