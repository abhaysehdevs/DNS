import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            orderId,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            pincode,
            totalAmount,
            discountAmount = 0,
            couponCode = null,
            paymentMethod = 'whatsapp',
            mode = 'retail',
            notes = '',
            items = []
        } = body;

        if (!orderId || !customerName || !shippingAddress || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const fullAddress = `${shippingAddress}${pincode && pincode !== 'N/A' && !shippingAddress.includes(pincode) ? ` (Pincode: ${pincode})` : ''}`;

        // 1. Insert order record with schema resilience
        try {
            const { error } = await supabase.from('orders').upsert({
                id: orderId,
                customer_name: customerName,
                customer_email: customerEmail || 'customer@dinanathandsons.com',
                customer_phone: customerPhone || '',
                shipping_address: fullAddress,
                total_amount: Number(totalAmount),
                discount_amount: Number(discountAmount) || 0,
                coupon_code: couponCode || null,
                status: 'pending',
                payment_status: 'pending',
                payment_method: paymentMethod,
                type: mode,
                notes: notes || null,
                created_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (error) {
                console.warn('Orders initial upsert warning:', error.message);
                // Fallback attempt with minimal core columns if optional columns like discount_amount/type are missing in Postgres
                const { error: retryError } = await supabase.from('orders').upsert({
                    id: orderId,
                    customer_name: customerName,
                    customer_email: customerEmail || 'customer@dinanathandsons.com',
                    customer_phone: customerPhone || '',
                    shipping_address: fullAddress,
                    total_amount: Number(totalAmount),
                    status: 'pending',
                    payment_method: paymentMethod
                }, { onConflict: 'id' });
                
                if (retryError) {
                    console.error('Order fallback insert error:', retryError);
                }
            }
        } catch (e) {
            console.error('Exception writing to orders table:', e);
        }

        // 2. Insert order items
        if (items && items.length > 0) {
            const dbItems = items.map((it: any) => ({
                order_id: orderId,
                product_id: it.productId || it.product_id,
                product_name: it.productName || it.product_name || 'Product',
                variant_name: it.variantName || it.variant_name || null,
                quantity: Number(it.quantity) || 1,
                price: Number(it.price) || 0,
                subtotal: (Number(it.price) || 0) * (Number(it.quantity) || 1)
            }));

            try {
                const { error: itemsError } = await supabase.from('order_items').insert(dbItems);
                if (itemsError) {
                    console.error('Order items insert error:', itemsError);
                }
            } catch (e) {
                console.error('Exception writing to order_items table:', e);
            }
        }

        // 3. Increment coupon usage if applied
        if (couponCode) {
            try {
                await supabase.rpc('increment_coupon_usage_by_code', { code: couponCode });
            } catch (e) {
                // Ignore coupon rpc error if not defined
            }
        }

        // 4. Send background email notification
        try {
            const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://dinanathandsons.com';
            await fetch(`${siteOrigin}/api/notifications/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'order',
                    orderId: orderId,
                    customerName: customerName,
                    customerEmail: customerEmail,
                    customerPhone: customerPhone,
                    shippingAddress: fullAddress,
                    totalAmount: totalAmount,
                    paymentMethod: paymentMethod,
                    items: items.map((it: any) => ({
                        product_name: it.productName || it.product_name,
                        variant_name: it.variantName || it.variant_name || null,
                        quantity: it.quantity,
                        price: it.price,
                        product_url: it.productUrl || `${siteOrigin}/shop/${it.productSlug || it.productId}`
                    }))
                })
            }).catch(err => console.warn('Email trigger notification error:', err));
        } catch (e) {
            // Ignore notification failure
        }

        return NextResponse.json({ success: true, orderId });
    } catch (error: any) {
        console.error('Error in /api/orders/create:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
