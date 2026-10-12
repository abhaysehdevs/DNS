import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

function getAdminClient() {
    return createClient(supabaseUrl, supabaseKey);
}

// GET: Retrieve audit log records
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);
        const resourceType = searchParams.get('resource_type');

        const supabase = getAdminClient();
        let query = supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (resourceType) {
            query = query.eq('resource_type', resourceType);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching audit logs:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, logs: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Record an audit log entry
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userEmail, action, resourceType, resourceId, details } = body;

        const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const clientIp = forwarded.split(',')[0].trim();

        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from('audit_logs')
            .insert({
                user_email: userEmail || 'ajayabhay12872@gmail.com',
                action: action || 'UNKNOWN',
                resource_type: resourceType || 'SYSTEM',
                resource_id: resourceId ? String(resourceId) : undefined,
                details: details || {},
                ip_address: clientIp
            })
            .select()
            .single();

        if (error) {
            console.error('Error writing to audit_logs:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, log: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
