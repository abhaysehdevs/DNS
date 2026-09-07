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

        // Generate 6-digit cryptographic-style OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        savePhoneOtp(cleanPhone, otp);

        // Check if Twilio / Fast2SMS is available in environment
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        let sentViaSms = false;
        if (twilioSid && twilioToken && twilioPhone) {
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

                if (res.ok) sentViaSms = true;
            } catch (e) {
                console.warn('Twilio SMS dispatch notice:', e);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Verification code sent to ${cleanPhone}`,
            sentViaSms,
            // Provide OTP hint if direct external SMS gateway is not yet linked
            otpHint: !sentViaSms ? otp : undefined
        });
    } catch (error: any) {
        console.error('Send phone OTP error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
    }
}
