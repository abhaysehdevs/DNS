import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { subject, headline, content, ctaLabel, ctaLink, recipients } = body;

        const resendApiKey = process.env.RESEND_API_KEY;
        const senderEmail = 'Dinanath & Sons <info@dinanathandsons.com>';

        const htmlContent = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #151515; color: #F8F3E8; border-radius: 12px; border: 1px solid #343434;">
                <div style="padding: 30px 20px; text-align: center; border-bottom: 1px solid #343434;">
                    <h1 style="color: #A67C35; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">DINANATH & SONS</h1>
                    <p style="color: #8E8E9A; margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Jewellery Tools & Equipment — Since 1960</p>
                </div>
                
                <div style="padding: 30px 20px;">
                    ${headline ? `<h2 style="color: #F8F3E8; margin-top: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">${headline}</h2>` : ''}
                    <div style="color: #CFCFCF; font-size: 14px; line-height: 1.7; whitespace: pre-line; margin-bottom: 25px;">
                        ${content}
                    </div>

                    ${ctaLabel && ctaLink ? `
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${ctaLink}" style="background-color: #A67C35; color: #000000; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 8px; letter-spacing: 1.5px; text-transform: uppercase; display: inline-block;">
                                ${ctaLabel}
                            </a>
                        </div>
                    ` : ''}
                </div>

                <div style="padding: 20px; border-top: 1px solid #343434; text-align: center; color: #8E8E9A; font-size: 10px; line-height: 1.5;">
                    <p style="margin: 0 0 5px 0; text-transform: uppercase; font-weight: 700;">Dinanath & Sons Hardware Store</p>
                    <p style="margin: 0;">1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006</p>
                    <p style="margin: 5px 0 0 0;">You are receiving this email because you subscribed to our catalog updates.</p>
                </div>
            </div>
        `;

        if (resendApiKey) {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                    from: 'Dinanath & Sons <onboarding@resend.dev>',
                    to: recipients && recipients.length > 0 ? recipients : ['info@dinanathandsons.com'],
                    subject: subject,
                    html: htmlContent
                })
            });

            const data = await response.json();
            return NextResponse.json({ success: true, data });
        } else {
            console.log('\n==================================================');
            console.log('[NEWSLETTER BROADCAST SIMULATION]');
            console.log(`Recipients Count: ${recipients?.length || 0}`);
            console.log(`Subject: ${subject}`);
            console.log(`Headline: ${headline}`);
            console.log('HTML Body Generated Successfully.');
            console.log('==================================================\n');

            return NextResponse.json({ success: true, simulated: true });
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Newsletter broadcast error' }, { status: 500 });
    }
}
