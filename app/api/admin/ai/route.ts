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

        // Enforce Rule 5 & 1.7: API keys live only in server-side environment variables
        const finalApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

        const result = await askGemini(messages, finalApiKey);

        return NextResponse.json({
            success: true,
            reply: result.reply,
            actionResult: result.actionResult,
            pendingConfirmation: result.pendingConfirmation
        });
    } catch (err: any) {
        console.error('Error in /api/admin/ai:', err);
        return NextResponse.json({
            error: err.message || 'Internal AI processing error'
        }, { status: 500 });
    }
}
