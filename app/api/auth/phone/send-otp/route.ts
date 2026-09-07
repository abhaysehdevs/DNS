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
                    // Secondary: Fast2SMS POST
                    const postRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                        method: 'POST',
                        headers: {
                            'authorization': fast2smsKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            route: 'otp',
                            variables_values: otp,
                            numbers: raw10Digit
                        })
                    });
                    const postData = await postRes.json();
                    if (postData.return === true) {
                        sentViaSms = true;
                        console.log(`[Fast2SMS POST] OTP successfully dispatched to ${raw10Digit}`);
                    } else {
                        console.warn('[Fast2SMS Notice]:', postData);
                    }
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

        // 3. MSG91 Integration (Indian SMS Gateway)
        const msg91AuthKey = process.env.MSG91_AUTH_KEY;
        const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
        if (!sentViaSms && msg91AuthKey && msg91TemplateId) {
            try {
                const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${msg91TemplateId}&mobile=91${raw10Digit}&authkey=${msg91AuthKey}&otp=${otp}`;
                const res = await fetch(msg91Url, { method: 'POST' });
                if (res.ok) {
                    sentViaSms = true;
                    console.log(`[MSG91] OTP dispatched to ${raw10Digit}`);
                }
            } catch (e) {
                console.warn('[MSG91 Error]:', e);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Verification code sent to ${cleanPhone}`,
            sentViaSms
        });
    } catch (error: any) {
        console.error('Send phone OTP error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
    }
}
