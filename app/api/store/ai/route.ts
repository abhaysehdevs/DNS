import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Query message is required' }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const query = message.trim();
        const lower = query.toLowerCase();

        // 1. Search products from Supabase
        const { data: matchedProducts } = await supabase
            .from('products')
            .select('id, name, retail_price, wholesale_price, category, image, in_stock, description, slug')
            .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(4);

        // 2. Wire & Appliance recommendations
        let advice = '';
        if (lower.includes('ac') || lower.includes('air conditioner')) {
            advice = '💡 **AI Electrical Recommendation**: For 1.5 Ton AC, use **2.5 mm² Copper FR-LSH Wire** with a 16A C-Curve MCB. For 2.0 Ton AC, step up to **4.0 mm² Copper Wire** with a 20A/25A breaker for safety.';
        } else if (lower.includes('geyser') || lower.includes('water heater')) {
            advice = '💡 **AI Electrical Recommendation**: Water geysers (2000W) should be wired using **2.5 mm² Copper Wire** connected to a dedicated 16A 3-pin socket with a 16A MCB or RCCB for shock protection.';
        } else if (lower.includes('pump') || lower.includes('submersible') || lower.includes('motor')) {
            advice = '💡 **AI Electrical Recommendation**: Submersible pumps require **3-Core Flat Submersible Cable** (2.5 mm² up to 100m depth, 4.0 mm² for deeper borewells) along with a proper motor starter panel.';
        } else if (lower.includes('wholesale') || lower.includes('b2b') || lower.includes('bulk') || lower.includes('moq')) {
            advice = '📦 **B2B Wholesale Trade Desk**: Dinanath & Sons provides special wholesale pricing and official GST tax invoices for contractors, electricians, and bulk buyers. Contact our trade desk directly on WhatsApp: +91 9953435647.';
        } else if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('track')) {
            advice = '🚚 **Pan-India Delivery**: Orders are dispatched within 24-48 hours from our central Delhi warehouse. Express courier is available for Delhi NCR and standard courier takes 3-6 business days nationwide.';
        }

        return NextResponse.json({
            success: true,
            advice: advice || null,
            products: matchedProducts || []
        });
    } catch (err: any) {
        console.error('Store AI API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
