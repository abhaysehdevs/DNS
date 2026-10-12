import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY);
    return NextResponse.json({
        configured: hasKey,
        model: 'gemini-2.5-flash / gemini-1.5-flash',
        message: hasKey 
            ? 'Gemini API key is securely configured in server environment variables.' 
            : 'Gemini API key is not configured in server environment variables (GEMINI_API_KEY).'
    });
}
