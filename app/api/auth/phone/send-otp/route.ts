import { NextResponse } from 'next/server';
import { savePhoneOtp } from '@/lib/phone-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone } = body;

        if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
            return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
        }

        let cleanPhone = phone.trim().replace(/\s+/g, '').replace(/-/g, '');
        if (!cleanPhone.startsWith('+')) {
            if (cleanPhone.length === 10) cleanPhone = '+91' + cleanPhone;
            else if (cleanPhone.startsWith('91')) cleanPhone = '+' + cleanPhone;
            else cleanPhone = '+91' + cleanPhone;
        }

        const raw10Digit = cleanPhone.replace('+91', '').slice(-10);

        // Generate 6-digit secure OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        savePhoneOtp(cleanPhone, otp);

        console.log(`[SMS OTP Engine] Verification code generated for ${cleanPhone}: ${otp}`);

        let sentViaSms = false;
        let providerError: string | null = null;

        // 1. FAST2SMS Integration (Instant Free/Paid SMS for India)
        const fast2smsKey = process.env.FAST2SMS_API_KEY;
        if (fast2smsKey) {
            try {
                // Primary: Fast2SMS Quick OTP API (GET)
                const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&route=otp&variables_values=${encodeURIComponent(otp)}&flash=0&numbers=${encodeURIComponent(raw10Digit)}`;
                const res = await fetch(getUrl, {
                    method: 'GET',
                    headers: { 'cache-control': 'no-cache' }
                });

                const data = await res.json();
                if (data.return === true || (data.status_code && data.status_code === 200)) {
                    sentViaSms = true;
                    console.log(`[Fast2SMS] OTP successfully dispatched to ${raw10Digit}:`, data);
                } else {
                    if (data.status_code === 996) {
                        providerError = "Fast2SMS requires 1-time Website Verification: In your Fast2SMS dashboard, click 'Smart OTP' on the left menu and add 'dinanathandsons.com' to enable live SMS.";
                    } else if (data.message) {
                        providerError = typeof data.message === 'string' ? data.message : data.message[0];
                    }
                    console.warn('[Fast2SMS Notice]:', data);
                }
            } catch (e: any) {
                console.warn('[Fast2SMS Error]:', e);
            }
        }

        // 2. TWILIO Integration (Global SMS)
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!sentViaSms && twilioSid && twilioToken && twilioPhone) {
            try {
                const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
                const params = new URLSearchParams();
                params.append('To', cleanPhone);
                params.append('From', twilioPhone);
                params.append('Body', `Your Dinanath & Sons verification code is ${otp}. Valid for 10 minutes.`);

                const res = await fetch(twilioUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params.toString()
                });

                if (res.ok) {
                    sentViaSms = true;
                    console.log(`[Twilio] OTP successfully dispatched to ${cleanPhone}`);
                }
            } catch (e) {
                console.warn('[Twilio Error]:', e);
            }
        }

        if (!sentViaSms && providerError) {
            return NextResponse.json({
                success: false,
                error: providerError,
                sentViaSms: false
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `Verification code dispatched to ${cleanPhone}`,
            sentViaSms
        });
    } catch (error: any) {
        console.error('Send phone OTP error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
    }
}
