import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/admin-ai/ai-client';
import { getAdminSupabase } from '@/lib/admin-ai/ai-tools';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, apiKey: providedKey } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        // Verify admin authorization: Check header
        const authHeader = req.headers.get('x-admin-secret') || req.headers.get('authorization');
        const adminEmail = req.headers.get('x-admin-email');

        // Optional extra security check if email is provided
        if (adminEmail && adminEmail !== 'ajayabhay12872@gmail.com') {
            return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
        }

        // Check if there is an API key in site_settings if not passed directly or in env
        let finalApiKey = providedKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
        if (!finalApiKey) {
            try {
                const supabase = getAdminSupabase();
                const { data } = await supabase.from('site_settings').select('settings').eq('key', 'global').single();
                if (data?.settings?.geminiApiKey) {
                    finalApiKey = data.settings.geminiApiKey;
                }
            } catch (err) {
                // Ignore DB lookup error and continue to fallback
            }
        }

        const result = await askGemini(messages, finalApiKey);

        return NextResponse.json({
            success: true,
            reply: result.reply,
            actionResult: result.actionResult
        });
    } catch (err: any) {
        console.error('Error in /api/admin/ai:', err);
        return NextResponse.json({
            error: err.message || 'Internal AI processing error'
        }, { status: 500 });
    }
}
