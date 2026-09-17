import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Default fallback configuration if DB table is uninitialized
const DEFAULT_POPUP_CONFIG = {
    id: 'default-popup',
    isActive: false,
    title: 'Exclusive Trade Discount on Goldsmith Equipment',
    description: 'Register your workshop today or use our welcome code to unlock 10% off your initial order of precision tools & machinery.',
    couponCode: 'WELCOME10',
    imageUrl: '/images/products/sand-blasting-dust-collector-machine.png',
    delaySeconds: 5,
};

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
    return createClient(supabaseUrl, supabaseKey);
}

// GET: Fetch active or current marketing popup configuration
export async function GET() {
    try {
        const supabase = getSupabaseClient();
        
        // Attempt to fetch from marketing_popups table
        const { data, error } = await supabase
            .from('marketing_popups')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error || !data) {
            return NextResponse.json({
                success: true,
                popup: DEFAULT_POPUP_CONFIG
            });
        }

        // Map snake_case database schema to camelCase response
        return NextResponse.json({
            success: true,
            popup: {
                id: data.id || 'current-popup',
                isActive: Boolean(data.is_active),
                title: data.title || DEFAULT_POPUP_CONFIG.title,
                description: data.description || DEFAULT_POPUP_CONFIG.description,
                couponCode: data.coupon_code || '',
                imageUrl: data.image_url || '',
                delaySeconds: Number(data.delay_seconds) >= 0 ? Number(data.delay_seconds) : 5,
                updatedAt: data.updated_at || null
            }
        });
    } catch (err: any) {
        console.warn('API /api/marketing-popup GET error, returning fallback:', err);
        return NextResponse.json({
            success: true,
            popup: DEFAULT_POPUP_CONFIG
        });
    }
}

// POST or PUT: Update or create marketing popup configuration
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            isActive = false,
            title = '',
            description = '',
            couponCode = '',
            imageUrl = '',
            delaySeconds = 5
        } = body;

        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required fields.' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseClient();

        // 1. Try to find existing record ID
        const { data: existing } = await supabase
            .from('marketing_popups')
            .select('id')
            .limit(1)
            .maybeSingle();

        const recordId = existing?.id || '00000000-0000-0000-0000-000000000001';

        // 2. Upsert record with camelCase & snake_case compatibility
        const payload = {
            id: recordId,
            is_active: Boolean(isActive),
            title: title.trim(),
            description: description.trim(),
            coupon_code: couponCode ? couponCode.trim().toUpperCase() : null,
            image_url: imageUrl ? imageUrl.trim() : null,
            delay_seconds: Math.max(0, parseInt(delaySeconds, 10) || 5),
            updated_at: new Date().toISOString()
        };

        const { error: upsertError } = await supabase
            .from('marketing_popups')
            .upsert(payload, { onConflict: 'id' });

        if (upsertError) {
            console.error('Supabase marketing_popups upsert error:', upsertError);
            return NextResponse.json(
                { error: upsertError.message || 'Failed to save configuration.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Marketing popup updated successfully.',
            popup: {
                id: recordId,
                isActive: payload.is_active,
                title: payload.title,
                description: payload.description,
                couponCode: payload.coupon_code,
                imageUrl: payload.image_url,
                delaySeconds: payload.delay_seconds,
                updatedAt: payload.updated_at
            }
        });
    } catch (err: any) {
        console.error('API /api/marketing-popup POST error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    return POST(req);
}
