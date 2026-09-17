'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { products } from '@/lib/data';

export default function SeedPage() {
    const [status, setStatus] = useState('Idle');
    const [log, setLog] = useState<string[]>([]);

    const seedDatabase = async () => {
        setStatus('Seeding...');
        setLog([]);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            setStatus('Error: Missing environment variables');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        try {

            // First, clear existing data to avoid duplicates
            await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

            const itemsToInsert = products.map(p => ({
                name: p.name,
                description: p.description,
                retail_price: p.retailPrice,
                wholesale_price: p.wholesalePrice || 0,
                wholesale_moq: p.wholesaleMOQ,
                image: p.image,
                category: p.category,
                in_stock: p.inStock,
                reviews: p.reviews,
            }));

            const { data, error } = await supabase
                .from('products')
                .insert(itemsToInsert)
                .select();

            if (error) {
                console.error(error);
                setLog(prev => [...prev, `Error: ${error.message}`, `Details: ${error.details}`, `Hint: ${error.hint}`]);
                setStatus('Failed');
            } else {
                setLog(prev => [...prev, `Successfully inserted ${data.length} products.`]);
                setStatus('Success');
            }

        } catch (e: any) {
            setLog(prev => [...prev, `Exception: ${e.message}`]);
            setStatus('Exception');
        }
    };

    return (
        <div className="p-10 bg-[#FAF9F5] text-[#18181B] min-h-screen font-mono">
            <h1 className="text-2xl font-bold mb-4 text-[#18181B]">Database Seeder</h1>
            <button
                onClick={seedDatabase}
                className="bg-[#966E2E] hover:bg-[#7D5A25] text-white px-5 py-2.5 rounded-xl font-sans font-medium transition shadow-sm"
            >
                Start Seeding
            </button>
            <div className="mt-6 p-4 border border-[#E8E2D5] rounded-2xl bg-white shadow-sm">
                <p className="font-bold border-b border-[#E8E2D5] pb-2 mb-2 text-[#966E2E]">Status: {status}</p>
                {log.length === 0 && <p className="text-xs text-[#71717A]">No operations executed yet.</p>}
                {log.map((line, i) => (
                    <div key={i} className="text-sm text-[#52525B]">{line}</div>
                ))}
            </div>
        </div>
    );
}
