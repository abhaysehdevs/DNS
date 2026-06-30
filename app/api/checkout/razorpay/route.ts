import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { amount, receipt } = await req.json();

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // If no credentials exist, return simulated order details for developer test modes
        if (!keyId || !keySecret) {
            return NextResponse.json({
                id: 'order_mock_' + Math.floor(Math.random() * 1000000000),
                amount: amount,
                currency: 'INR',
                receipt: receipt || 'receipt_sandbox'
            });
        }

        // Call official Razorpay Orders API
        const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            },
            body: JSON.stringify({
                amount: Math.round(amount), // Amount in paise
                currency: 'INR',
                receipt: receipt || 'receipt_online'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error?.description || 'Failed to create Razorpay order' }, { status: response.status });
        }

        return NextResponse.json({
            id: data.id,
            amount: data.amount,
            currency: data.currency,
            receipt: data.receipt
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
