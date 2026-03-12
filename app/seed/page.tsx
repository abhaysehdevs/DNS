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
                wholesale_price: p.wholesalePrice,
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
        <div className="p-10 bg-black text-white min-h-screen font-mono">
            <h1 className="text-2xl mb-4">Database Seeder</h1>
            <button
                onClick={seedDatabase}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
                Start Seeding
            </button>
            <div className="mt-4 p-4 border border-gray-800 rounded bg-gray-900">
                <p className="font-bold border-b border-gray-700 pb-2 mb-2">Status: {status}</p>
                {log.map((line, i) => (
                    <div key={i} className="text-sm text-gray-300">{line}</div>
                ))}
            </div>
        </div>
    );
}
