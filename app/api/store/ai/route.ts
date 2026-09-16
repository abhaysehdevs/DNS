import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { products as localProducts } from '@/lib/data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Query message is required' }, { status: 400 });
        }

        const query = message.trim();
        const lower = query.toLowerCase();

        // 1. Search products from Supabase, or fallback to local catalog
        let matchedProducts: any[] = [];
        try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data } = await supabase
                .from('products')
                .select('id, name, retail_price, wholesale_price, category, image, in_stock, description, slug')
                .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
                .limit(4);
            if (data && data.length > 0) {
                matchedProducts = data;
            }
        } catch (e) {
            // fallback
        }

        if (matchedProducts.length === 0) {
            const terms = lower.split(' ').filter(t => t.length > 2);
            matchedProducts = localProducts.filter(p => {
                const text = `${p.name} ${p.category} ${p.description}`.toLowerCase();
                return terms.some(t => text.includes(t));
            }).slice(0, 4).map(p => ({
                id: p.id,
                name: p.name,
                retail_price: p.retailPrice,
                wholesale_price: p.wholesalePrice,
                category: p.category,
                image: p.image || p.primaryImage,
                in_stock: p.inStock,
                slug: p.slug
            }));
        }

        // 2. Expert Jewellery Tools & Workshop Advice
        let advice = '';
        if (lower.includes('tweezer') || lower.includes('plier') || lower.includes('cutter') || lower.includes('hand tool')) {
            advice = '💎 **Jewellery Hand Tools Recommendation**: For stone setting, filigree, and precision benchwork, we recommend **15F Curved Ultra-Fine Tweezers** or **AA Straight Tempered Tweezers** (non-magnetic SUS316 surgical stainless steel with 62 HRC hardened tips). For wire cutting, our **Precision Nipper Flush Cutters** ensure burr-free cuts on gold and silver wire.';
        } else if (lower.includes('torch') || lower.includes('melting') || lower.includes('soldering') || lower.includes('borax') || lower.includes('suhaga')) {
            advice = '🔥 **Brazing & Soldering Recommendation**: For gold and silver casting, our **Automatic Piezo Gas Torch** reaches up to 3200°F (1760°C) with instant push-button ignition. Pair it with **Suhaga Goti (Borax lumps)** for protective flux paste that keeps gold solder clean and oxidation-free.';
        } else if (lower.includes('polishing') || lower.includes('buff') || lower.includes('rouge') || lower.includes('shine') || lower.includes('cleaner')) {
            advice = '✨ **Polishing & Buffing Recommendation**: For high mirror lustre on gold and silver, use **Stitched Cotton Buffs** with Dialux or green rouge compound. For rapid oxide removal without metal loss, use **Tik-Tak Silver & Gold Cleaner** bath.';
        } else if (lower.includes('machine') || lower.includes('dust collector') || lower.includes('sand blast') || lower.includes('recovery')) {
            advice = '⚙️ **Workshop Machinery**: Our **Sand Blasting & Dual Dust Collector Machine** is engineered with a 2.5 HP copper wound motor and 500 CFM vacuum suction to capture and recover microscopic gold dust while texturing precious metal surfaces.';
        } else if (lower.includes('wholesale') || lower.includes('b2b') || lower.includes('bulk') || lower.includes('moq') || lower.includes('workshop')) {
            advice = '📦 **B2B Workshop Procurement**: Dinanath & Sons provides manufacturer-direct wholesale rates and official GST tax invoices for goldsmith workshops, casting factories, and retail showrooms across India. Contact our Chandni Chowk trade desk on WhatsApp: +91 9953435647.';
        } else if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('courier') || lower.includes('dispatch')) {
            advice = '🚚 **Pan-India Dispatch**: All jewellery tools and equipment are packed securely and dispatched within 24-48 hours from our store in Maliwara, Chandni Chowk, Delhi with live tracking.';
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
