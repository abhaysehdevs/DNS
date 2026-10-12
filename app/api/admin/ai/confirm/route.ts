import { NextResponse } from 'next/server';
import { executeAdminTool } from '@/lib/admin-ai/ai-client';
import { getAdminSupabase } from '@/lib/admin-ai/ai-tools';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, args, typedConfirmation } = body;
        const adminEmail = req.headers.get('x-admin-email') || 'ajayabhay12872@gmail.com';

        // Check if AI write actions are disabled globally
        const supabase = getAdminSupabase();
        const { data: siteSettings } = await supabase
            .from('site_settings')
            .select('settings')
            .eq('key', 'global')
            .single();

        if (siteSettings?.settings?.disableAiWrites) {
            return NextResponse.json({
                error: 'AI write actions are currently disabled in Settings by the administrator.'
            }, { status: 403 });
        }

        // Validate typed confirmation if needed
        if (action === 'delete_product' && typedConfirmation !== 'CONFIRM') {
            return NextResponse.json({
                error: 'Please type "CONFIRM" to authorize this destructive deletion.'
            }, { status: 400 });
        }

        // Execute the tool
        const result = await executeAdminTool(action, args);

        // Record in audit log
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
        await supabase.from('audit_logs').insert({
            user_email: adminEmail,
            action: `AI_WRITE_${action.toUpperCase()}`,
            resource_type: 'AI_ACTION',
            resource_id: args?.id || args?.name || undefined,
            details: { action, args, resultMessage: result.message, success: result.success },
            ip_address: clientIp
        });

        return NextResponse.json({
            success: result.success,
            message: result.message,
            actionResult: result
        });
    } catch (err: any) {
        console.error('Error executing confirmed AI action:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
