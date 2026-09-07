import { NextResponse } from 'next/server';
import { verifyStoredOtp } from '@/lib/phone-auth';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone, otp, name } = body;

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone number and OTP code are required' }, { status: 400 });
        }

        let cleanPhone = phone.trim().replace(/\s+/g, '').replace(/-/g, '');
        if (!cleanPhone.startsWith('+')) {
            if (cleanPhone.length === 10) cleanPhone = '+91' + cleanPhone;
            else if (cleanPhone.startsWith('91')) cleanPhone = '+' + cleanPhone;
            else cleanPhone = '+91' + cleanPhone;
        }

        // 1. Verify OTP from memory store or universal test code
        const verification = verifyStoredOtp(cleanPhone, otp.trim());
        const isMasterTestOtp = otp.trim() === '123456';

        if (!verification.valid && !isMasterTestOtp) {
            return NextResponse.json({ error: verification.reason || 'Invalid verification code' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const syntheticEmail = `${cleanPhone.replace('+', '')}@phone.dinanathandsons.com`;
        const customerName = name?.trim() || `Customer ${cleanPhone.slice(-4)}`;
        const userId = 'usr_' + cleanPhone.replace('+', '');

        // 2. Check or create customer in profiles table if available
        try {
            await supabase.from('profiles').upsert({
                id: userId,
                phone: cleanPhone,
                full_name: customerName,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
        } catch (e) {
            // Non-blocking if profiles table has specific constraints
        }

        const userObj = {
            id: userId,
            email: syntheticEmail,
            name: customerName,
            phone: cleanPhone,
            created_at: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            user: userObj
        });
    } catch (error: any) {
        console.error('Verify phone OTP error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}
