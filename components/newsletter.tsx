
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Newsletter() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setLoading(true);
            try {
                const { error } = await supabase
                    .from('newsletter_subscribers')
                    .insert([{ email }]);

                if (error) throw error;

                setSubscribed(true);
                setTimeout(() => {
                    setEmail('');
                    setSubscribed(false);
                }, 3000);
            } catch (err) {
                console.error("Error subscribing:", err);
                alert("Failed to subscribe. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <section className="bg-amber-600 py-16">
            <div className="container mx-auto px-4 text-center">
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto border border-white/10">
                    <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
                    <p className="text-amber-50 mb-8 text-lg">
                        Subscribe for exclusive offers, jewelry making tips, and new product launch updates.
                    </p>

                    {subscribed ? (
                        <div className="flex items-center justify-center gap-2 text-white bg-green-500/20 py-3 rounded-lg border border-green-500/50">
                            <Check size={20} /> Thanks for subscribing!
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 h-auto disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Subscribe'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
